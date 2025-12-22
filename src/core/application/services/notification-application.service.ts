import { Injectable, Inject } from '@nestjs/common';
import {
  NotificationApplicationPort,
  CreateNotificationCommand,
} from '../ports/inbound/notification-application.port';
import { INotificationRepositoryPort } from '../../domain/ports/outbound/notification-repository.port';
import { NotificationDomainEntity, NotificationTypeDomain } from '../../domain/entities/notification.domain-entity';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class NotificationApplicationService implements NotificationApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.NOTIFICATION)
    private readonly notificationRepository: INotificationRepositoryPort,
  ) {}

  async createNotification(command: CreateNotificationCommand): Promise<NotificationDomainEntity> {
    const notification = NotificationDomainEntity.builder()
      .withType(command.type)
      .withTitle(command.title)
      .withMessage(command.message)
      .withFkReservationId(command.reservationId || null)
      .withIsRead(false)
      .build();

    return await this.notificationRepository.save(notification);
  }

  async getNotificationById(id: number): Promise<NotificationDomainEntity | null> {
    return await this.notificationRepository.findById(id);
  }

  async getUnreadNotifications(): Promise<NotificationDomainEntity[]> {
    return await this.notificationRepository.findUnread();
  }

  async getAllNotifications(page: number = 1, limit: number = 10): Promise<{ data: NotificationDomainEntity[]; total: number }> {
    return await this.notificationRepository.findPaged(page, limit);
  }

  async getNotificationsByType(type: NotificationTypeDomain): Promise<NotificationDomainEntity[]> {
    return await this.notificationRepository.findByType(type);
  }

  async getNotificationsByReservation(reservationId: number): Promise<NotificationDomainEntity[]> {
    return await this.notificationRepository.findByReservationId(reservationId);
  }

  async getRecentNotifications(hours: number): Promise<NotificationDomainEntity[]> {
    return await this.notificationRepository.findRecent(hours);
  }

  async markAsRead(id: number): Promise<NotificationDomainEntity | null> {
    return await this.notificationRepository.markAsRead(id);
  }

  async markMultipleAsRead(ids: number[]): Promise<number> {
    return await this.notificationRepository.markMultipleAsRead(ids);
  }

  async countUnreadNotifications(): Promise<number> {
    return await this.notificationRepository.countUnread();
  }

  async deleteNotification(id: number): Promise<boolean> {
    return await this.notificationRepository.delete(id);
  }

  async deleteOldReadNotifications(days: number): Promise<number> {
    return await this.notificationRepository.deleteOldReadNotifications(days);
  }

  async createPaymentProofNotification(
    reservationId: number, 
    paymentProofId: number,
    userName: string,
    subScenarioName: string,
    isUpdate: boolean
  ): Promise<NotificationDomainEntity> {
    return await this.notificationRepository.createPaymentProofNotification(
      reservationId, 
      paymentProofId,
      userName,
      subScenarioName,
      isUpdate
    );
  }

  async createReceiptGeneratedNotification(reservationId: number, receiptId: number): Promise<NotificationDomainEntity> {
    return await this.notificationRepository.createReceiptGeneratedNotification(reservationId, receiptId);
  }

  async createReceiptSentNotification(reservationId: number, receiptId: number, email: string): Promise<NotificationDomainEntity> {
    return await this.notificationRepository.createReceiptSentNotification(reservationId, receiptId, email);
  }

  async getNotificationStatistics(): Promise<{
    totalUnread: number;
    totalByType: Record<NotificationTypeDomain, number>;
    avgReadTime: number;
  }> {
    // Placeholder implementation
    const totalUnread = await this.notificationRepository.countUnread();

    return {
      totalUnread,
      totalByType: {
        [NotificationTypeDomain.PAYMENT_PROOF_UPLOADED]: 5,
        [NotificationTypeDomain.RECEIPT_GENERATED]: 3,
        [NotificationTypeDomain.RECEIPT_SENT]: 2,
      },
      avgReadTime: 2.5, // hours
    };
  }
}