import { ReceiptDomainEntity } from '../../entities/receipt.domain-entity';

export interface IReceiptRepositoryPort {
  /**
   * Finds all receipts for a specific reservation
   */
  findByReservationId(reservationId: number): Promise<ReceiptDomainEntity[]>;

  /**
   * Finds receipts with pagination
   */
  findPaged(page: number, limit: number): Promise<{ data: ReceiptDomainEntity[]; total: number }>;

  /**
   * Finds a receipt by ID
   */
  findById(id: number): Promise<ReceiptDomainEntity | null>;

  /**
   * Saves a receipt (create or update)
   */
  save(receipt: ReceiptDomainEntity): Promise<ReceiptDomainEntity>;

  /**
   * Deletes a receipt by ID
   */
  delete(id: number): Promise<boolean>;

  /**
   * Finds receipts generated within a date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<ReceiptDomainEntity[]>;

  /**
   * Finds unsent receipts (not emailed yet)
   */
  findUnsent(): Promise<ReceiptDomainEntity[]>;

  /**
   * Finds the latest receipt for a reservation
   */
  findLatestByReservationId(reservationId: number): Promise<ReceiptDomainEntity | null>;

  /**
   * Marks a receipt as sent via email
   */
  markAsSent(id: number, email: string, sentAt: Date): Promise<ReceiptDomainEntity | null>;

  /**
   * Counts receipts by template
   */
  countByTemplateId(templateId: number): Promise<number>;

  /**
   * Finds receipts that need to be sent (business rule based)
   */
  findPendingForSending(): Promise<ReceiptDomainEntity[]>;
}