import { NotificationDomainEntity, NotificationTypeDomain } from '../../../domain/entities/notification.domain-entity';

export interface CreateNotificationCommand {
  type: NotificationTypeDomain;
  title: string;
  message: string;
  reservationId?: number;
  metadata?: Record<string, any>;
}

export interface NotificationApplicationPort {
  /**
   * Creates a new notification
   */
  createNotification(command: CreateNotificationCommand): Promise<NotificationDomainEntity>;

  /**
   * Gets notification by ID
   */
  getNotificationById(id: number): Promise<NotificationDomainEntity | null>;

  /**
   * Gets all unread notifications
   */
  getUnreadNotifications(): Promise<NotificationDomainEntity[]>;

  /**
   * Gets all notifications with pagination
   */
  getAllNotifications(page?: number, limit?: number): Promise<{ data: NotificationDomainEntity[]; total: number }>;

  /**
   * Gets notifications by type
   */
  getNotificationsByType(type: NotificationTypeDomain): Promise<NotificationDomainEntity[]>;

  /**
   * Gets notifications for a reservation
   */
  getNotificationsByReservation(reservationId: number): Promise<NotificationDomainEntity[]>;

  /**
   * Gets recent notifications
   */
  getRecentNotifications(hours: number): Promise<NotificationDomainEntity[]>;

  /**
   * Marks a notification as read
   */
  markAsRead(id: number): Promise<NotificationDomainEntity | null>;

  /**
   * Marks multiple notifications as read
   */
  markMultipleAsRead(ids: number[]): Promise<number>;

  /**
   * Counts unread notifications
   */
  countUnreadNotifications(): Promise<number>;

  /**
   * Deletes a notification
   */
  deleteNotification(id: number): Promise<boolean>;

  /**
   * Deletes old read notifications
   */
  deleteOldReadNotifications(days: number): Promise<number>;

  /**
   * Creates payment proof notification
   */
  createPaymentProofNotification(
    reservationId: number, 
    paymentProofId: number,
    userName: string,
    subScenarioName: string,
    isUpdate: boolean
  ): Promise<NotificationDomainEntity>;

  /**
   * Creates receipt generated notification
   */
  createReceiptGeneratedNotification(reservationId: number, receiptId: number): Promise<NotificationDomainEntity>;

  /**
   * Creates receipt sent notification
   */
  createReceiptSentNotification(reservationId: number, receiptId: number, email: string): Promise<NotificationDomainEntity>;

  /**
   * Gets notification statistics
   */
  getNotificationStatistics(): Promise<{
    totalUnread: number;
    totalByType: Record<NotificationTypeDomain, number>;
    avgReadTime: number;
  }>;
}