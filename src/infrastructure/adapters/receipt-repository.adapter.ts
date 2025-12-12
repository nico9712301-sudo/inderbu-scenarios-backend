import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between, IsNull, Not } from 'typeorm';

import { IReceiptRepositoryPort } from '../../core/domain/ports/outbound/receipt-repository.port';
import { ReceiptDomainEntity } from '../../core/domain/entities/receipt.domain-entity';
import { ReceiptEntity } from '../persistence/receipt.entity';
import { ReceiptEntityMapper } from '../mappers/receipt/receipt-entity.mapper';
import { MYSQL_REPOSITORY } from '../tokens/repositories';

@Injectable()
export class ReceiptRepositoryAdapter implements IReceiptRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.RECEIPT)
    private readonly receiptRepository: Repository<ReceiptEntity>,
  ) {}

  async findByReservationId(reservationId: number): Promise<ReceiptDomainEntity[]> {
    const entities = await this.receiptRepository.find({
      where: { fkReservationId: reservationId },
      order: {
        createdAt: 'DESC',
      },
    });

    return ReceiptEntityMapper.toDomainArray(entities);
  }

  async findPaged(page: number, limit: number): Promise<{ data: ReceiptDomainEntity[]; total: number }> {
    const [entities, total] = await this.receiptRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: ReceiptEntityMapper.toDomainArray(entities),
      total,
    };
  }

  async findById(id: number): Promise<ReceiptDomainEntity | null> {
    const entity = await this.receiptRepository.findOne({
      where: { id },
    });

    return entity ? ReceiptEntityMapper.toDomain(entity) : null;
  }

  async save(receipt: ReceiptDomainEntity): Promise<ReceiptDomainEntity> {
    const entity = ReceiptEntityMapper.toEntity(receipt);
    const savedEntity = await this.receiptRepository.save(entity);
    return ReceiptEntityMapper.toDomain(savedEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.receiptRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ReceiptDomainEntity[]> {
    const entities = await this.receiptRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return ReceiptEntityMapper.toDomainArray(entities);
  }

  async findUnsent(): Promise<ReceiptDomainEntity[]> {
    const entities = await this.receiptRepository.find({
      where: {
        sentAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return ReceiptEntityMapper.toDomainArray(entities);
  }

  async findLatestByReservationId(reservationId: number): Promise<ReceiptDomainEntity | null> {
    const entity = await this.receiptRepository.findOne({
      where: { fkReservationId: reservationId },
      order: {
        createdAt: 'DESC',
      },
    });

    return entity ? ReceiptEntityMapper.toDomain(entity) : null;
  }

  async markAsSent(id: number, email: string, sentAt: Date): Promise<ReceiptDomainEntity | null> {
    const entity = await this.receiptRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.sentAt = sentAt;
    entity.sentToEmail = email;
    entity.updatedAt = new Date();

    const savedEntity = await this.receiptRepository.save(entity);
    return ReceiptEntityMapper.toDomain(savedEntity);
  }

  async countByTemplateId(templateId: number): Promise<number> {
    return await this.receiptRepository.count({
      where: { fkTemplateId: templateId },
    });
  }

  async findPendingForSending(): Promise<ReceiptDomainEntity[]> {
    const entities = await this.receiptRepository.find({
      where: {
        sentAt: IsNull(),
        generatedAt: Not(IsNull()),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return ReceiptEntityMapper.toDomainArray(entities);
  }
}