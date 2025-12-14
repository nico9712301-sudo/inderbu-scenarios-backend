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
    pricing: SubScenarioPriceDomainEntity | null,
    additionalData: {
      customerEmail: string;
      customerName: string;
      subScenarioName: string;
      scenarioName: string;
    },
  ): ReceiptData {
    // Calculate total hours from timeslots if available
    let totalHours = 0;

    // Check if reservation has timeslots attached (from repository with relations)
    const reservationWithTimeslots = reservation as any;
    if (reservationWithTimeslots.timeslots && Array.isArray(reservationWithTimeslots.timeslots)) {
      reservationWithTimeslots.timeslots.forEach((reservationTimeslot: any) => {
        if (reservationTimeslot.timeslot) {
          const timeslot = reservationTimeslot.timeslot;
          if (timeslot.startTime && timeslot.endTime) {
            // Parse time strings (format: "HH:mm")
            const [startHour, startMin] = timeslot.startTime.split(':').map(Number);
            const [endHour, endMin] = timeslot.endTime.split(':').map(Number);

            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            const hours = (endMinutes - startMinutes) / 60;
            totalHours += hours;
          }
        }
      });

      // If it's a RANGE reservation, check for instances or multiply by totalInstances
      if (reservation.type === 'RANGE' && reservationWithTimeslots.instances) {
        const instanceCount = reservationWithTimeslots.instances.length || 1;
        totalHours *= instanceCount;
      } else if (reservation.type === 'RANGE' && reservationWithTimeslots.totalInstances) {
        totalHours *= reservationWithTimeslots.totalInstances;
      }

      // Round up to nearest hour
      totalHours = Math.ceil(totalHours);
    } else {
      // Fallback: use placeholder calculation if timeslots not available
      const startDate = new Date();
      const endDate = new Date(Date.now() + 3600000); // +1 hour
      totalHours = this.calculateHours(startDate, endDate);
    }

    // If pricing is null or hourlyPrice is 0, set totalCost to 0
    const hourlyPrice = pricing?.hourlyPrice || 0;
    const totalCost = totalHours * hourlyPrice;

    return {
      reservation,
      pricing: pricing || this.createDefaultPricing(reservation.subScenarioId),
      totalCost,
      totalHours,
      ...additionalData,
    };
  }

  /**
   * Creates a default pricing entity when pricing is not configured
   */
  private createDefaultPricing(subScenarioId: number): SubScenarioPriceDomainEntity {
    return SubScenarioPriceDomainEntity.builder()
      .withFkSubScenarioId(subScenarioId)
      .withHourlyPrice(0)
      .build();
  }

  /**
   * Processes template with receipt data to generate HTML
   */
  processReceiptTemplate(
    template: TemplateDomainEntity,
    receiptData: ReceiptData,
  ): { isValid: boolean; htmlContent?: string; error?: string } {
    console.log({template});
    console.log({receiptData});
    
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
    variablesValues: { hourlyPrice: number; totalCost: number },
    generatedAt: Date = new Date(),
  ): ReceiptDomainEntity {
    return ReceiptDomainEntity.builder()
      .withFkReservationId(reservationId)
      .withFkTemplateId(templateId)
      .withVariablesValues(variablesValues)
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

    if (!receipt.variablesValues) {
      return { isValid: false, reason: 'El recibo no tiene valores de variables válidos' };
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
      .withVariablesValues(receipt.variablesValues)
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
    console.log({variables});
    console.log({components: templateContent.components});
    
    for (const component of templateContent.components) {
      html += this.renderComponent(component, variables);
    }

    html += '</body></html>';

    // Replace all variables in the final HTML
    for (const [variable, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    console.log({finalhtml: html});
    

    return html;
  }

  private renderComponent(component: any, variables: Record<string, string>): string {
    switch (component.type) {
      case 'header':
        return `<div class="header"><h1>${component.text || ''}</h1></div>`;
      case 'text':
        return `<div class="content"><p>${component.text || ''}</p></div>`;
      case 'title':
        const titleText = component.props?.text || component.text || '';
        let titleHtml = titleText;
        // Replace variables in title
        for (const [variable, value] of Object.entries(variables)) {
          titleHtml = titleHtml.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
        return `<div class="header"><h1>${titleHtml}</h1></div>`;
      case 'logo':
        const logoSrc = component.props?.src || component.src || '';
        return `<div class="header"><img src="${logoSrc}" alt="Logo" style="max-height: 100px;"></div>`;
      case 'client-data':
        return `<div class="content">
          <h3>Datos del Cliente</h3>
          <p><strong>Nombre:</strong> ${variables['{{customer_name}}'] || 'N/A'}</p>
          <p><strong>Email:</strong> ${variables['{{customer_email}}'] || 'N/A'}</p>
        </div>`;
      case 'concepts-table':
        return `<div class="content">
          <h3>Conceptos</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descripción</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Cantidad</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Precio</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${variables['{{sub_scenario_name}}'] || 'Reservación'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${variables['{{total_hours}}'] || '0'} horas</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${variables['{{hourly_price}}'] || '$0.00'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${variables['{{total_cost}}'] || '$0.00'}</td>
              </tr>
            </tbody>
          </table>
        </div>`;
      case 'hourly-cost':
        return `<div class="content">
          <h3>Información de Costo</h3>
          <p><strong>Precio por hora:</strong> ${variables['{{hourly_price}}'] || '$0.00'}</p>
          <p><strong>Total de horas:</strong> ${variables['{{total_hours}}'] || '0'}</p>
          <p><strong>Costo total:</strong> ${variables['{{total_cost}}'] || '$0.00'}</p>
        </div>`;
      case 'table':
        return this.renderTable(component.data || []);
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