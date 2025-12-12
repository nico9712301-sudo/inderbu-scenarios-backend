import { ReceiptDomainEntity } from '../../../domain/entities/receipt.domain-entity';

export interface GenerateReceiptCommand {
  reservationId: number;
  templateId: number;
  customerEmail?: string;
}

export interface SendReceiptCommand {
  receiptId: number;
  email: string;
}

export interface ReceiptManagementApplicationPort {
  /**
   * Generates a new receipt for a reservation
   */
  generateReceipt(command: GenerateReceiptCommand): Promise<ReceiptDomainEntity>;

  /**
   * Sends a receipt via email
   */
  sendReceipt(command: SendReceiptCommand): Promise<ReceiptDomainEntity>;

  /**
   * Gets receipt by ID
   */
  getReceiptById(id: number): Promise<ReceiptDomainEntity | null>;

  /**
   * Gets all receipts for a reservation
   */
  getReceiptsByReservation(reservationId: number): Promise<ReceiptDomainEntity[]>;

  /**
   * Gets all receipts with pagination
   */
  getAllReceipts(page?: number, limit?: number): Promise<{ data: ReceiptDomainEntity[]; total: number }>;

  /**
   * Gets receipts within date range
   */
  getReceiptsByDateRange(startDate: Date, endDate: Date): Promise<ReceiptDomainEntity[]>;

  /**
   * Gets unsent receipts
   */
  getUnsentReceipts(): Promise<ReceiptDomainEntity[]>;

  /**
   * Gets receipts pending for sending
   */
  getReceiptsPendingForSending(): Promise<ReceiptDomainEntity[]>;

  /**
   * Validates if receipt can be generated
   */
  validateReceiptGeneration(reservationId: number, templateId: number): Promise<{ isValid: boolean; reason?: string }>;

  /**
   * Validates if receipt can be sent
   */
  validateReceiptSending(receiptId: number, email: string): Promise<{ isValid: boolean; reason?: string }>;

  /**
   * Deletes a receipt
   */
  deleteReceipt(id: number): Promise<boolean>;

  /**
   * Gets receipt statistics
   */
  getReceiptStatistics(): Promise<{
    totalGenerated: number;
    totalSent: number;
    totalUnsent: number;
    avgGenerationTime: number;
  }>;
}