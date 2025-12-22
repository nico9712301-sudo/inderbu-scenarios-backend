import { Injectable, Inject } from '@nestjs/common';
import { Repository, MoreThan, LessThan, In } from 'typeorm';

import { INotificationRepositoryPort } from '../../core/domain/ports/outbound/notification-repository.port';
import { NotificationDomainEntity, NotificationTypeDomain } from '../../core/domain/entities/notification.domain-entity';
import { NotificationEntity } from '../persistence/notification.entity';
import { NotificationEntityMapper } from '../mappers/notification/notification-entity.mapper';
import { MYSQL_REPOSITORY } from '../tokens/repositories';

@Injectable()
export class NotificationRepositoryAdapter implements INotificationRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.NOTIFICATION)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async findUnread(): Promise<NotificationDomainEntity[]> {
    const entities = await this.notificationRepository.find({
      where: {
        isRead: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return NotificationEntityMapper.toDomainArray(entities);
  }

  async findPaged(page: number, limit: number): Promise<{ data: NotificationDomainEntity[]; total: number }> {
    const [entities, total] = await this.notificationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: NotificationEntityMapper.toDomainArray(entities),
      total,
    };
  }

  async findById(id: number): Promise<NotificationDomainEntity | null> {
    const entity = await this.notificationRepository.findOne({
      where: { id },
    });

    return entity ? NotificationEntityMapper.toDomain(entity) : null;
  }

  async save(notification: NotificationDomainEntity): Promise<NotificationDomainEntity> {
    const entity = NotificationEntityMapper.toEntity(notification);
    const savedEntity = await this.notificationRepository.save(entity);
    return NotificationEntityMapper.toDomain(savedEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.notificationRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByType(type: NotificationTypeDomain): Promise<NotificationDomainEntity[]> {
    const entities = await this.notificationRepository.find({
      where: {
        type: type as any,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return NotificationEntityMapper.toDomainArray(entities);
  }

  async findByReservationId(reservationId: number): Promise<NotificationDomainEntity[]> {
    const entities = await this.notificationRepository.find({
      where: { fkReservationId: reservationId },
      order: {
        createdAt: 'DESC',
      },
    });

    return NotificationEntityMapper.toDomainArray(entities);
  }

  async markAsRead(id: number): Promise<NotificationDomainEntity | null> {
    const entity = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.isRead = true;
    entity.readAt = new Date();
    entity.updatedAt = new Date();

    const savedEntity = await this.notificationRepository.save(entity);
    return NotificationEntityMapper.toDomain(savedEntity);
  }

  async markMultipleAsRead(ids: number[]): Promise<number> {
    const result = await this.notificationRepository.update(
      { id: In(ids) },
      {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      },
    );

    return result.affected || 0;
  }

  async countUnread(): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        isRead: false,
      },
    });
  }

  async findRecent(hours: number): Promise<NotificationDomainEntity[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const entities = await this.notificationRepository.find({
      where: {
        createdAt: MoreThan(cutoffDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return NotificationEntityMapper.toDomainArray(entities);
  }

  async deleteOldReadNotifications(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.notificationRepository.delete({
      isRead: true,
      readAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  async createPaymentProofNotification(
    reservationId: number, 
    paymentProofId: number,
    userName: string,
    subScenarioName: string,
    isUpdate: boolean
  ): Promise<NotificationDomainEntity> {
    const action = isUpdate ? 'actualizado' : 'subido';
    const notification = NotificationDomainEntity.builder()
      .withType(NotificationTypeDomain.PAYMENT_PROOF_UPLOADED)
      .withTitle('Nuevo comprobante de pago')
      .withMessage(`${userName} ha ${action} un comprobante de pago para la reserva en ${subScenarioName}`)
      .withFkReservationId(reservationId)
      .withFkPaymentProofId(paymentProofId)
      .withIsRead(false)
      .build();

    return await this.save(notification);
  }

  async createReceiptGeneratedNotification(reservationId: number, receiptId: number): Promise<NotificationDomainEntity> {
    const notification = NotificationDomainEntity.builder()
      .withType(NotificationTypeDomain.RECEIPT_GENERATED)
      .withTitle('Recibo generado')
      .withMessage(`Se ha generado un nuevo recibo para la reservación #${reservationId}`)
      .withFkReservationId(reservationId)
      .withFkReceiptId(receiptId)
      .withIsRead(false)
      .build();

    return await this.save(notification);
  }

  async createReceiptSentNotification(reservationId: number, receiptId: number, email: string): Promise<NotificationDomainEntity> {
    const notification = NotificationDomainEntity.builder()
      .withType(NotificationTypeDomain.RECEIPT_SENT)
      .withTitle('Recibo enviado')
      .withMessage(`Se ha enviado el recibo de la reservación #${reservationId} a ${email}`)
      .withFkReservationId(reservationId)
      .withFkReceiptId(receiptId)
      .withIsRead(false)
      .build();

    return await this.save(notification);
  }
}