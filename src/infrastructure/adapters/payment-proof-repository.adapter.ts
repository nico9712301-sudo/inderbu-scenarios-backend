import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between, MoreThan } from 'typeorm';

import { IPaymentProofRepositoryPort } from '../../core/domain/ports/outbound/payment-proof-repository.port';
import { PaymentProofDomainEntity } from '../../core/domain/entities/payment-proof.domain-entity';
import { PaymentProofEntity } from '../persistence/payment-proof.entity';
import { PaymentProofEntityMapper } from '../mappers/payment-proof/payment-proof-entity.mapper';
import { MYSQL_REPOSITORY } from '../tokens/repositories';

@Injectable()
export class PaymentProofRepositoryAdapter implements IPaymentProofRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.PAYMENT_PROOF)
    private readonly paymentProofRepository: Repository<PaymentProofEntity>,
  ) {}

  async findByReservationId(reservationId: number): Promise<PaymentProofDomainEntity[]> {
    const entities = await this.paymentProofRepository.find({
      where: { fkReservationId: reservationId },
      order: {
        createdAt: 'DESC',
      },
    });

    return PaymentProofEntityMapper.toDomainArray(entities);
  }

  async findPaged(page: number, limit: number): Promise<{ data: PaymentProofDomainEntity[]; total: number }> {
    const [entities, total] = await this.paymentProofRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: PaymentProofEntityMapper.toDomainArray(entities),
      total,
    };
  }

  async findById(id: number): Promise<PaymentProofDomainEntity | null> {
    const entity = await this.paymentProofRepository.findOne({
      where: { id },
    });

    return entity ? PaymentProofEntityMapper.toDomain(entity) : null;
  }

  async save(paymentProof: PaymentProofDomainEntity): Promise<PaymentProofDomainEntity> {
    const entity = PaymentProofEntityMapper.toEntity(paymentProof);
    const savedEntity = await this.paymentProofRepository.save(entity);
    return PaymentProofEntityMapper.toDomain(savedEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.paymentProofRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByUserId(userId: number): Promise<PaymentProofDomainEntity[]> {
    const entities = await this.paymentProofRepository.find({
      where: { uploadedByUserId: userId },
      order: {
        createdAt: 'DESC',
      },
    });

    return PaymentProofEntityMapper.toDomainArray(entities);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<PaymentProofDomainEntity[]> {
    const entities = await this.paymentProofRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return PaymentProofEntityMapper.toDomainArray(entities);
  }

  async hasPaymentProofs(reservationId: number): Promise<boolean> {
    const count = await this.paymentProofRepository.count({
      where: { fkReservationId: reservationId },
    });

    return count > 0;
  }

  async findLatestByReservationId(reservationId: number): Promise<PaymentProofDomainEntity | null> {
    const entity = await this.paymentProofRepository.findOne({
      where: { fkReservationId: reservationId },
      order: {
        createdAt: 'DESC',
      },
    });

    return entity ? PaymentProofEntityMapper.toDomain(entity) : null;
  }

  async countByReservationId(reservationId: number): Promise<number> {
    return await this.paymentProofRepository.count({
      where: { fkReservationId: reservationId },
    });
  }

  async findRecentUploads(hours: number): Promise<PaymentProofDomainEntity[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const entities = await this.paymentProofRepository.find({
      where: {
        createdAt: MoreThan(cutoffDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return PaymentProofEntityMapper.toDomainArray(entities);
  }

  async validateFile(mimeType: string, fileSize: number): Promise<boolean> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    return allowedMimeTypes.includes(mimeType) && fileSize <= maxFileSize;
  }
}