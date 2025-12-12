import { Injectable, Inject } from '@nestjs/common';
import {
  PaymentProofApplicationPort,
  UploadPaymentProofCommand,
} from '../ports/inbound/payment-proof-application.port';
import { IPaymentProofRepositoryPort } from '../../domain/ports/outbound/payment-proof-repository.port';
import { IReservationRepositoryPort } from '../../domain/ports/outbound/reservation-repository.port';
import { PaymentProofDomainEntity } from '../../domain/entities/payment-proof.domain-entity';
import { PaymentValidationDomainService } from '../../domain/services/payment-validation.domain-service';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class PaymentProofApplicationService implements PaymentProofApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.PAYMENT_PROOF)
    private readonly paymentProofRepository: IPaymentProofRepositoryPort,
    @Inject(REPOSITORY_PORTS.RESERVATION)
    private readonly reservationRepository: IReservationRepositoryPort,
    private readonly paymentValidationDomainService: PaymentValidationDomainService,
  ) {}

  async uploadPaymentProof(command: UploadPaymentProofCommand): Promise<PaymentProofDomainEntity> {
    // Validate reservation exists
    const reservation = await this.reservationRepository.findById(command.reservationId);
    if (!reservation) {
      throw new Error('Reservación no encontrada');
    }

    // Get existing payment proofs
    const existingProofs = await this.paymentProofRepository.findByReservationId(command.reservationId);

    // Validate file
    const fileValidation = this.paymentValidationDomainService.validatePaymentProofFile({
      mimeType: command.mimeType,
      size: command.fileSize,
      originalName: command.originalFileName,
    });

    if (!fileValidation.isValid) {
      throw new Error(fileValidation.reason);
    }

    // Validate business rules
    const businessValidation = this.paymentValidationDomainService.validatePaymentProofSubmission(
      reservation,
      0, // totalCost would be calculated
      existingProofs,
    );

    if (!businessValidation.isValid) {
      throw new Error(businessValidation.reason);
    }

    // Create payment proof entity
    const paymentProof = PaymentProofDomainEntity.builder()
      .withFkReservationId(command.reservationId)
      .withFileUrl(command.fileUrl)
      .withOriginalFilename(command.originalFileName)
      .withMimeType(command.mimeType)
      .withFileSize(command.fileSize)
      .withUploadedByUserId(command.uploadedByUserId)
      .build();

    return await this.paymentProofRepository.save(paymentProof);
  }

  async getPaymentProofById(id: number): Promise<PaymentProofDomainEntity | null> {
    return await this.paymentProofRepository.findById(id);
  }

  async getPaymentProofsByReservation(reservationId: number): Promise<PaymentProofDomainEntity[]> {
    return await this.paymentProofRepository.findByReservationId(reservationId);
  }

  async getAllPaymentProofs(page: number = 1, limit: number = 10): Promise<{ data: PaymentProofDomainEntity[]; total: number }> {
    return await this.paymentProofRepository.findPaged(page, limit);
  }

  async getPaymentProofsByUser(userId: number): Promise<PaymentProofDomainEntity[]> {
    return await this.paymentProofRepository.findByUserId(userId);
  }

  async getPaymentProofsByDateRange(startDate: Date, endDate: Date): Promise<PaymentProofDomainEntity[]> {
    return await this.paymentProofRepository.findByDateRange(startDate, endDate);
  }

  async getRecentPaymentProofUploads(hours: number): Promise<PaymentProofDomainEntity[]> {
    return await this.paymentProofRepository.findRecentUploads(hours);
  }

  async validatePaymentProofUpload(
    reservationId: number,
    file: { mimeType: string; size: number; originalName: string }
  ): Promise<{ isValid: boolean; reason?: string }> {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      return { isValid: false, reason: 'Reservación no encontrada' };
    }

    const existingProofs = await this.paymentProofRepository.findByReservationId(reservationId);
    const fileValidation = this.paymentValidationDomainService.validatePaymentProofFile(file);

    if (!fileValidation.isValid) {
      return fileValidation;
    }

    return this.paymentValidationDomainService.validatePaymentProofSubmission(reservation, 0, existingProofs);
  }

  async hasPaymentProofs(reservationId: number): Promise<boolean> {
    return await this.paymentProofRepository.hasPaymentProofs(reservationId);
  }

  async getLatestPaymentProof(reservationId: number): Promise<PaymentProofDomainEntity | null> {
    return await this.paymentProofRepository.findLatestByReservationId(reservationId);
  }

  async countPaymentProofs(reservationId: number): Promise<number> {
    return await this.paymentProofRepository.countByReservationId(reservationId);
  }

  async deletePaymentProof(id: number): Promise<boolean> {
    return await this.paymentProofRepository.delete(id);
  }

  async getPaymentProofStatistics(): Promise<{
    totalUploaded: number;
    totalThisMonth: number;
    avgFileSize: number;
    mostUsedFileType: string;
  }> {
    // Placeholder implementation
    return {
      totalUploaded: 150,
      totalThisMonth: 25,
      avgFileSize: 2048000, // 2MB
      mostUsedFileType: 'image/jpeg',
    };
  }
}