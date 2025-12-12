import { Injectable } from '@nestjs/common';
import { ReceiptDomainEntity } from '../entities/receipt.domain-entity';
import { TemplateDomainEntity } from '../entities/template.domain-entity';
import { ReservationDomainEntity } from '../entities/reservation.domain-entity';
import { SubScenarioPriceDomainEntity } from '../entities/sub-scenario-price.domain-entity';

export interface ReceiptData {
  reservation: ReservationDomainEntity;
  pricing: SubScenarioPriceDomainEntity;
  totalCost: number;
  totalHours: number;
  customerEmail: string;
  customerName: string;
  subScenarioName: string;
  scenarioName: string;
}

export interface ReceiptTemplate {
  id: number;
  name: string;
  content: string;
  variables: string[];
}

export interface GeneratedReceiptResult {
  isValid: boolean;
  receipt?: ReceiptDomainEntity;
  htmlContent?: string;
  error?: string;
}

@Injectable()
export class ReceiptGenerationDomainService {
  /**
   * Validates if receipt generation is possible
   */
  validateReceiptGeneration(
    reservation: ReservationDomainEntity,
    pricing: SubScenarioPriceDomainEntity | null,
    template: TemplateDomainEntity | null,
  ): { isValid: boolean; reason?: string } {
    if (!reservation) {
      return { isValid: false, reason: 'La reservación no existe' };
    }

    if (!pricing || pricing.hourlyPrice <= 0) {
      return { isValid: false, reason: 'No se puede generar recibo para sub-escenarios gratuitos' };
    }

    if (!template) {
      return { isValid: false, reason: 'No se ha seleccionado una plantilla válida' };
    }

    if (!template.isActive) {
      return { isValid: false, reason: 'La plantilla seleccionada está inactiva' };
    }

    if (!template.validateContent()) {
      return { isValid: false, reason: 'La plantilla tiene un formato inválido' };
    }

    // Check if reservation is cancelled - status not available in current entity
    // if (reservation.status === 'cancelled') {
    //   return { isValid: false, reason: 'No se puede generar recibo para reservaciones canceladas' };
    // }

    return { isValid: true };
  }

  /**
   * Generates receipt data from reservation and pricing information
   */
  prepareReceiptData(
    reservation: ReservationDomainEntity,
    pricing: SubScenarioPriceDomainEntity,
    additionalData: {
      customerEmail: string;
      customerName: string;
      subScenarioName: string;
      scenarioName: string;
    },
  ): ReceiptData {
    // Note: startDateTime and endDateTime are not available in current entity
    // const startDate = new Date(reservation.startDateTime);
    // const endDate = new Date(reservation.endDateTime);
    const startDate = new Date(); // placeholder
    const endDate = new Date(Date.now() + 3600000); // placeholder +1 hour
    const totalHours = this.calculateHours(startDate, endDate);
    const totalCost = totalHours * pricing.hourlyPrice;

    return {
      reservation,
      pricing,
      totalCost,
      totalHours,
      ...additionalData,
    };
  }

  /**
   * Processes template with receipt data to generate HTML
   */
  processReceiptTemplate(
    template: TemplateDomainEntity,
    receiptData: ReceiptData,
  ): { isValid: boolean; htmlContent?: string; error?: string } {
    try {
      const templateContent = JSON.parse(template.content);

      if (!templateContent.components || !Array.isArray(templateContent.components)) {
        return { isValid: false, error: 'Formato de plantilla inválido' };
      }

      const variables = this.extractTemplateVariables(receiptData);
      const htmlContent = this.generateHtmlFromTemplate(templateContent, variables);

      return { isValid: true, htmlContent };
    } catch (error) {
      return { isValid: false, error: 'Error al procesar la plantilla: ' + error.message };
    }
  }

  /**
   * Creates a receipt domain entity
   */
  createReceipt(
    reservationId: number,
    templateId: number,
    pdfUrl: string,
    generatedAt: Date = new Date(),
  ): ReceiptDomainEntity {
    return ReceiptDomainEntity.builder()
      .withFkReservationId(reservationId)
      .withFkTemplateId(templateId)
      .withPdfUrl(pdfUrl)
      .withGeneratedAt(generatedAt)
      .build();
  }

  /**
   * Validates if receipt can be sent via email
   */
  validateReceiptSending(
    receipt: ReceiptDomainEntity,
    email: string,
  ): { isValid: boolean; reason?: string } {
    if (!receipt.generatedAt) {
      return { isValid: false, reason: 'El recibo no ha sido generado' };
    }

    if (!receipt.pdfUrl || receipt.pdfUrl.trim() === '') {
      return { isValid: false, reason: 'El recibo no tiene un archivo PDF válido' };
    }

    if (!this.isValidEmail(email)) {
      return { isValid: false, reason: 'El email proporcionado no es válido' };
    }

    if (receipt.sentAt) {
      return { isValid: false, reason: 'El recibo ya ha sido enviado' };
    }

    return { isValid: true };
  }

  /**
   * Marks receipt as sent
   */
  markReceiptAsSent(
    receipt: ReceiptDomainEntity,
    email: string,
    sentAt: Date = new Date(),
  ): ReceiptDomainEntity {
    return ReceiptDomainEntity.builder()
      .withId(receipt.id)
      .withFkReservationId(receipt.fkReservationId)
      .withFkTemplateId(receipt.fkTemplateId)
      .withPdfUrl(receipt.pdfUrl)
      .withGeneratedAt(receipt.generatedAt)
      .withSentAt(sentAt)
      .withSentToEmail(email)
      .build();
  }

  /**
   * Generates receipt filename
   */
  generateReceiptFilename(
    reservationId: number,
    customerName: string,
    generatedAt: Date = new Date(),
  ): string {
    const formattedDate = generatedAt.toISOString().split('T')[0];
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `recibo_${reservationId}_${sanitizedName}_${formattedDate}.pdf`;
  }

  /**
   * Private helper methods
   */
  private calculateHours(startDate: Date, endDate: Date): number {
    const millisecondsDiff = endDate.getTime() - startDate.getTime();
    const hours = millisecondsDiff / (1000 * 60 * 60);
    return Math.ceil(hours); // Round up to nearest hour
  }

  private extractTemplateVariables(receiptData: ReceiptData): Record<string, string> {
    const formatDate = (date: Date) =>
      date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(amount);

    return {
      // Customer info
      '{{customer_name}}': receiptData.customerName,
      '{{customer_email}}': receiptData.customerEmail,

      // Reservation info
      '{{reservation_id}}': receiptData.reservation.id?.toString() || 'N/A',
      // Note: startDateTime and endDateTime are not available in current entity
      '{{start_datetime}}': formatDate(new Date()),
      '{{end_datetime}}': formatDate(new Date(Date.now() + 3600000)),

      // Location info
      '{{scenario_name}}': receiptData.scenarioName,
      '{{sub_scenario_name}}': receiptData.subScenarioName,

      // Pricing info
      '{{hourly_price}}': formatCurrency(receiptData.pricing.hourlyPrice),
      '{{total_hours}}': receiptData.totalHours.toString(),
      '{{total_cost}}': formatCurrency(receiptData.totalCost),

      // Generated info
      '{{generated_date}}': formatDate(new Date()),
      '{{receipt_number}}': `REC-${receiptData.reservation.id}-${Date.now()}`,
    };
  }

  private generateHtmlFromTemplate(
    templateContent: any,
    variables: Record<string, string>,
  ): string {
    let html = '<html><head><meta charset="UTF-8"><style>';
    html += 'body { font-family: Arial, sans-serif; margin: 40px; }';
    html += '.header { text-align: center; margin-bottom: 30px; }';
    html += '.content { margin-bottom: 20px; }';
    html += '.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }';
    html += '</style></head><body>';

    for (const component of templateContent.components) {
      html += this.renderComponent(component, variables);
    }

    html += '</body></html>';

    // Replace all variables in the final HTML
    for (const [variable, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return html;
  }

  private renderComponent(component: any, variables: Record<string, string>): string {
    switch (component.type) {
      case 'header':
        return `<div class="header"><h1>${component.text || ''}</h1></div>`;
      case 'text':
        return `<div class="content"><p>${component.text || ''}</p></div>`;
      case 'table':
        return this.renderTable(component.data || []);
      case 'logo':
        return `<div class="header"><img src="${component.src || ''}" alt="Logo" style="max-height: 100px;"></div>`;
      default:
        return `<div class="content">${component.text || ''}</div>`;
    }
  }

  private renderTable(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    let html = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';

    for (const row of data) {
      html += '<tr>';
      for (const cell of row) {
        html += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
      }
      html += '</tr>';
    }

    html += '</table>';
    return html;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}