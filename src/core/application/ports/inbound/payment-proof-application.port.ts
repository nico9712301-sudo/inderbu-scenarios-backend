import { PaymentProofDomainEntity } from '../../../domain/entities/payment-proof.domain-entity';

export interface UploadPaymentProofCommand {
  reservationId: number;
  fileUrl: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedByUserId: number;
}

export interface UploadPaymentProofWithFileCommand {
  reservationId: number;
  uploadedByUserId: number;
  file: Express.Multer.File;
}

export interface PaymentProofApplicationPort {
  /**
   * Uploads a new payment proof
   */
  uploadPaymentProof(command: UploadPaymentProofCommand): Promise<PaymentProofDomainEntity>;

  /**
   * Uploads a new payment proof with file (uploads to R2 and creates notification)
   */
  uploadPaymentProofWithFile(command: UploadPaymentProofWithFileCommand): Promise<PaymentProofDomainEntity>;

  /**
   * Gets payment proof by ID
   */
  getPaymentProofById(id: number): Promise<PaymentProofDomainEntity | null>;

  /**
   * Gets all payment proofs for a reservation
   */
  getPaymentProofsByReservation(reservationId: number): Promise<PaymentProofDomainEntity[]>;

  /**
   * Gets all payment proofs with pagination
   */
  getAllPaymentProofs(page?: number, limit?: number): Promise<{ data: PaymentProofDomainEntity[]; total: number }>;

  /**
   * Gets payment proofs by user
   */
  getPaymentProofsByUser(userId: number): Promise<PaymentProofDomainEntity[]>;

  /**
   * Gets payment proofs within date range
   */
  getPaymentProofsByDateRange(startDate: Date, endDate: Date): Promise<PaymentProofDomainEntity[]>;

  /**
   * Gets recent payment proof uploads
   */
  getRecentPaymentProofUploads(hours: number): Promise<PaymentProofDomainEntity[]>;

  /**
   * Validates if payment proof can be uploaded
   */
  validatePaymentProofUpload(
    reservationId: number,
    file: { mimeType: string; size: number; originalName: string }
  ): Promise<{ isValid: boolean; reason?: string }>;

  /**
   * Checks if reservation has payment proofs
   */
  hasPaymentProofs(reservationId: number): Promise<boolean>;

  /**
   * Gets latest payment proof for a reservation
   */
  getLatestPaymentProof(reservationId: number): Promise<PaymentProofDomainEntity | null>;

  /**
   * Counts payment proofs for a reservation
   */
  countPaymentProofs(reservationId: number): Promise<number>;

  /**
   * Deletes a payment proof
   */
  deletePaymentProof(id: number): Promise<boolean>;

  /**
   * Gets payment proof statistics
   */
  getPaymentProofStatistics(): Promise<{
    totalUploaded: number;
    totalThisMonth: number;
    avgFileSize: number;
    mostUsedFileType: string;
  }>;
}