import { Injectable, Inject } from '@nestjs/common';
import {
  ReceiptManagementApplicationPort,
  GenerateReceiptCommand,
  SendReceiptCommand,
} from '../ports/inbound/receipt-management-application.port';
import { IReceiptRepositoryPort } from '../../domain/ports/outbound/receipt-repository.port';
import { ITemplateRepositoryPort } from '../../domain/ports/outbound/template-repository.port';
import { IReservationRepositoryPort } from '../../domain/ports/outbound/reservation-repository.port';
import { ISubScenarioPriceRepositoryPort } from '../../domain/ports/outbound/sub-scenario-price-repository.port';
import { IUserRepositoryPort } from '../../domain/ports/outbound/user-repository.port';
import { ISubScenarioRepositoryPort } from '../../domain/ports/outbound/sub-scenario-repository.port';
import { ReceiptDomainEntity } from '../../domain/entities/receipt.domain-entity';
import { SubScenarioPriceDomainEntity } from '../../domain/entities/sub-scenario-price.domain-entity';
import { ReceiptGenerationDomainService, ReceiptData } from '../../domain/services/receipt-generation.domain-service';
import { ReceiptHtmlRendererDomainService } from '../../domain/services/receipt-html-renderer.domain-service';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';
import { ReceiptEmailService } from '../../../infrastructure/adapters/outbound/email/receipt-email.service';

@Injectable()
export class ReceiptManagementApplicationService implements ReceiptManagementApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.RECEIPT)
    private readonly receiptRepository: IReceiptRepositoryPort,
    @Inject(REPOSITORY_PORTS.TEMPLATE)
    private readonly templateRepository: ITemplateRepositoryPort,
    @Inject(REPOSITORY_PORTS.RESERVATION)
    private readonly reservationRepository: IReservationRepositoryPort,
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO_PRICE)
    private readonly subScenarioPriceRepository: ISubScenarioPriceRepositoryPort,
    @Inject(REPOSITORY_PORTS.USER)
    private readonly userRepository: IUserRepositoryPort,
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO)
    private readonly subScenarioRepository: ISubScenarioRepositoryPort,
    private readonly receiptGenerationDomainService: ReceiptGenerationDomainService,
    private readonly receiptHtmlRendererDomainService: ReceiptHtmlRendererDomainService,
    private readonly receiptEmailService: ReceiptEmailService,
  ) { }

  async generateReceipt(command: GenerateReceiptCommand): Promise<ReceiptDomainEntity> {
    // Validate reservation exists
    const reservation = await this.reservationRepository.findById(command.reservationId);
    if (!reservation) {
      throw new Error('Reservación no encontrada');
    }

    // Validate template exists and is active
    const template = await this.templateRepository.findById(command.templateId);
    if (!template) {
      throw new Error('Plantilla no encontrada');
    }

    // Get sub-scenario first to check if it has cost
    const subScenario = await this.subScenarioRepository.findByIdWithRelations(reservation.subScenarioId);
    if (!subScenario) {
      throw new Error('Sub-escenario no encontrado');
    }

    // Early validation: Check if sub-scenario has cost
    if (!subScenario.hasCost) {
      throw new Error('No se puede generar recibo para sub-escenarios gratuitos');
    }

    // Get pricing information (may be null or have price 0, both are allowed)
    const pricing = await this.subScenarioPriceRepository.findBySubScenarioId(reservation.subScenarioId);

    // Validate receipt generation is possible
    const validation = this.receiptGenerationDomainService.validateReceiptGeneration(
      reservation,
      pricing,
      template,
    );

    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // Get user data
    const user = await this.userRepository.findById(reservation.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Extract scenario name from subScenario (already fetched above)
    const scenarioName = (subScenario as any).scenario?.name || 'Escenario';

    // Prepare receipt data with real customer/scenario data
    // pricing can be null or have price 0, both are handled in prepareReceiptData
    const receiptData: ReceiptData = this.receiptGenerationDomainService.prepareReceiptData(
      reservation,
      pricing,
      {
        customerEmail: command.customerEmail || user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        subScenarioName: subScenario.name,
        scenarioName: scenarioName,
      },
    );

    // Use hourlyPrice and totalCost from command if provided, otherwise use calculated values
    // Validate hourlyPrice minimum if provided
    let finalHourlyPrice = receiptData.pricing.hourlyPrice;
    let finalTotalCost = receiptData.totalCost;

    if (command.hourlyPrice !== undefined) {
      if (command.hourlyPrice < 1000) {
        throw new Error('El precio por hora debe ser al menos 1000 pesos');
      }
      finalHourlyPrice = command.hourlyPrice;
    }

    if (command.totalCost !== undefined) {
      finalTotalCost = command.totalCost;
    } else {
      // Recalculate totalCost if hourlyPrice was provided but totalCost wasn't
      if (command.hourlyPrice !== undefined) {
        finalTotalCost = receiptData.totalHours * command.hourlyPrice;
      }
    }

    // Create receipt domain entity with variables values
    // "Generar" recibo = solo guardar datos, no generar PDF
    const receipt = this.receiptGenerationDomainService.createReceipt(
      command.reservationId,
      command.templateId,
      {
        hourlyPrice: finalHourlyPrice,
        totalCost: finalTotalCost,
      },
    );

    // Save and return
    return await this.receiptRepository.save(receipt);
  }

  async sendReceipt(command: SendReceiptCommand): Promise<ReceiptDomainEntity> {
    // Get receipt with relations
    const receipt = await this.receiptRepository.findById(command.receiptId);
    if (!receipt) {
      throw new Error('Recibo no encontrado');
    }

    // Validate receipt can be sent
    const validation = this.receiptGenerationDomainService.validateReceiptSending(receipt, command.email);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // Get reservation data
    const reservation = await this.reservationRepository.findById(receipt.fkReservationId);
    if (!reservation) {
      throw new Error('Reservación no encontrada');
    }

    // Get user data
    const user = await this.userRepository.findById(reservation.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Get sub-scenario data
    const subScenario = await this.subScenarioRepository.findByIdWithRelations(reservation.subScenarioId);
    if (!subScenario) {
      throw new Error('Sub-escenario no encontrado');
    }

    // Get template data
    const template = await this.templateRepository.findById(receipt.fkTemplateId);
    if (!template) {
      throw new Error('Plantilla no encontrada');
    }

    // Parse template content
    let templateContent;
    try {
      templateContent = JSON.parse(template.content);
    } catch (error) {
      throw new Error('Error al parsear el contenido de la plantilla');
    }

    // Calculate total hours from receipt data
    const totalHours = receipt.variablesValues.hourlyPrice > 0
      ? Math.round(receipt.variablesValues.totalCost / receipt.variablesValues.hourlyPrice)
      : 0;

    // Format dates
    const reservationDate = reservation.initialDate
      ? new Date(reservation.initialDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('es-ES');

    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Get scenario name from subScenario
    const scenarioName = (subScenario as any).scenario?.name || 'Escenario';

    // Generate HTML from receipt
    const receiptHtml = this.receiptHtmlRendererDomainService.generateReceiptHtml({
      receipt,
      reservation,
      templateContent,
      clientName: `${user.firstName} ${user.lastName}`,
      clientEmail: user.email,
      clientPhone: user.phone || undefined,
      scenarioName,
      subScenarioName: subScenario.name,
      hourlyPrice: receipt.variablesValues.hourlyPrice,
      totalCost: receipt.variablesValues.totalCost,
      totalHours,
      reservationDate,
      currentDate,
      currentTime,
    });

    // Send email with HTML content
    await this.receiptEmailService.sendReceiptEmailWithHtml(command.email, receipt, receiptHtml);

    // Mark receipt as sent
    const updatedReceipt = this.receiptGenerationDomainService.markReceiptAsSent(receipt, command.email);

    // Save and return
    return await this.receiptRepository.save(updatedReceipt);
  }

  // Removed renderReceipt - PDF generation is now handled in the frontend using @react-pdf/renderer

  async getReceiptById(id: number): Promise<ReceiptDomainEntity | null> {
    return await this.receiptRepository.findById(id);
  }

  async getReceiptsByReservation(reservationId: number): Promise<ReceiptDomainEntity[]> {
    return await this.receiptRepository.findByReservationId(reservationId);
  }

  async getAllReceipts(page: number = 1, limit: number = 10): Promise<{ data: ReceiptDomainEntity[]; total: number }> {
    return await this.receiptRepository.findPaged(page, limit);
  }

  async getReceiptsByDateRange(startDate: Date, endDate: Date): Promise<ReceiptDomainEntity[]> {
    return await this.receiptRepository.findByDateRange(startDate, endDate);
  }

  async getUnsentReceipts(): Promise<ReceiptDomainEntity[]> {
    return await this.receiptRepository.findUnsent();
  }

  async getReceiptsPendingForSending(): Promise<ReceiptDomainEntity[]> {
    return await this.receiptRepository.findPendingForSending();
  }

  async validateReceiptGeneration(
    reservationId: number,
    templateId: number,
  ): Promise<{ isValid: boolean; reason?: string }> {
    // Get reservation
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      return { isValid: false, reason: 'Reservación no encontrada' };
    }

    // Get template
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      return { isValid: false, reason: 'Plantilla no encontrada' };
    }

    // Get sub-scenario first to check if it has cost
    const subScenario = await this.subScenarioRepository.findByIdWithRelations(reservation.subScenarioId);
    if (!subScenario) {
      return { isValid: false, reason: 'Sub-escenario no encontrado' };
    }

    // Early validation: Check if sub-scenario has cost
    if (!subScenario.hasCost) {
      return { isValid: false, reason: 'No se puede generar recibo para sub-escenarios gratuitos' };
    }

    // Get pricing (only if hasCost is true)
    const pricing = await this.subScenarioPriceRepository.findBySubScenarioId(reservation.subScenarioId);

    // Use domain service validation
    return this.receiptGenerationDomainService.validateReceiptGeneration(reservation, pricing, template);
  }

  async validateReceiptSending(receiptId: number, email: string): Promise<{ isValid: boolean; reason?: string }> {
    const receipt = await this.receiptRepository.findById(receiptId);
    if (!receipt) {
      return { isValid: false, reason: 'Recibo no encontrado' };
    }

    return this.receiptGenerationDomainService.validateReceiptSending(receipt, email);
  }

  async deleteReceipt(id: number): Promise<boolean> {
    return await this.receiptRepository.delete(id);
  }

  async getReceiptStatistics(): Promise<{
    totalGenerated: number;
    totalSent: number;
    totalUnsent: number;
    avgGenerationTime: number;
  }> {
    // This would require aggregate queries - placeholder implementation
    const allReceipts = await this.receiptRepository.findPaged(1, 1000);
    const totalGenerated = allReceipts.total;
    const totalSent = allReceipts.data.filter(r => r.sentAt !== null).length;
    const totalUnsent = totalGenerated - totalSent;

    return {
      totalGenerated,
      totalSent,
      totalUnsent,
      avgGenerationTime: 5.2, // placeholder
    };
  }
}