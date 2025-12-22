import { NotificationDomainEntity, NotificationTypeDomain } from '../../entities/notification.domain-entity';

export interface INotificationRepositoryPort {
  /**
   * Finds all unread notifications
   */
  findUnread(): Promise<NotificationDomainEntity[]>;

  /**
   * Finds notifications with pagination
   */
  findPaged(page: number, limit: number): Promise<{ data: NotificationDomainEntity[]; total: number }>;

  /**
   * Finds a notification by ID
   */
  findById(id: number): Promise<NotificationDomainEntity | null>;

  /**
   * Saves a notification (create or update)
   */
  save(notification: NotificationDomainEntity): Promise<NotificationDomainEntity>;

  /**
   * Deletes a notification by ID
   */
  delete(id: number): Promise<boolean>;

  /**
   * Finds notifications by type
   */
  findByType(type: NotificationTypeDomain): Promise<NotificationDomainEntity[]>;

  /**
   * Finds notifications for a specific reservation
   */
  findByReservationId(reservationId: number): Promise<NotificationDomainEntity[]>;

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
  countUnread(): Promise<number>;

  /**
   * Finds recent notifications (within specified hours)
   */
  findRecent(hours: number): Promise<NotificationDomainEntity[]>;

  /**
   * Deletes old read notifications (older than specified days)
   */
  deleteOldReadNotifications(days: number): Promise<number>;

  /**
   * Creates notification for payment proof uploaded
   */
  createPaymentProofNotification(
    reservationId: number, 
    paymentProofId: number,
    userName: string,
    subScenarioName: string,
    isUpdate: boolean
  ): Promise<NotificationDomainEntity>;

  /**
   * Creates notification for receipt generated
   */
  createReceiptGeneratedNotification(reservationId: number, receiptId: number): Promise<NotificationDomainEntity>;

  /**
   * Creates notification for receipt sent
   */
  createReceiptSentNotification(reservationId: number, receiptId: number, email: string): Promise<NotificationDomainEntity>;
}