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
import { ReceiptDomainEntity } from '../../domain/entities/receipt.domain-entity';
import { ReceiptGenerationDomainService, ReceiptData } from '../../domain/services/receipt-generation.domain-service';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

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
    private readonly receiptGenerationDomainService: ReceiptGenerationDomainService,
  ) {}

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

    // Get pricing information
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

    // Prepare receipt data (would need to get additional customer/scenario data)
    const receiptData: ReceiptData = this.receiptGenerationDomainService.prepareReceiptData(
      reservation,
      pricing!,
      {
        customerEmail: command.customerEmail || 'customer@example.com',
        customerName: 'Cliente',
        subScenarioName: 'Sub-escenario',
        scenarioName: 'Escenario',
      },
    );

    // Process template to generate HTML
    const templateProcessing = this.receiptGenerationDomainService.processReceiptTemplate(template, receiptData);
    if (!templateProcessing.isValid) {
      throw new Error(templateProcessing.error);
    }

    // Generate filename and create PDF URL (this would involve PDF generation service)
    const fileName = this.receiptGenerationDomainService.generateReceiptFilename(
      command.reservationId,
      receiptData.customerName,
    );

    // For now, use placeholder PDF URL - this would be replaced by actual PDF generation
    const pdfUrl = `https://receipts.example.com/${fileName}`;

    // Create receipt domain entity
    const receipt = this.receiptGenerationDomainService.createReceipt(
      command.reservationId,
      command.templateId,
      pdfUrl,
    );

    // Save and return
    return await this.receiptRepository.save(receipt);
  }

  async sendReceipt(command: SendReceiptCommand): Promise<ReceiptDomainEntity> {
    // Get receipt
    const receipt = await this.receiptRepository.findById(command.receiptId);
    if (!receipt) {
      throw new Error('Recibo no encontrado');
    }

    // Validate receipt can be sent
    const validation = this.receiptGenerationDomainService.validateReceiptSending(receipt, command.email);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // Mark receipt as sent (actual email sending would happen here)
    const updatedReceipt = this.receiptGenerationDomainService.markReceiptAsSent(receipt, command.email);

    // Save and return
    return await this.receiptRepository.save(updatedReceipt);
  }

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

    // Get pricing
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