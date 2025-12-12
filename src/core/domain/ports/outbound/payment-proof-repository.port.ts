import { PaymentProofDomainEntity } from '../../entities/payment-proof.domain-entity';

export interface IPaymentProofRepositoryPort {
  /**
   * Finds all payment proofs for a specific reservation
   */
  findByReservationId(reservationId: number): Promise<PaymentProofDomainEntity[]>;

  /**
   * Finds payment proofs with pagination
   */
  findPaged(page: number, limit: number): Promise<{ data: PaymentProofDomainEntity[]; total: number }>;

  /**
   * Finds a payment proof by ID
   */
  findById(id: number): Promise<PaymentProofDomainEntity | null>;

  /**
   * Saves a payment proof (create or update)
   */
  save(paymentProof: PaymentProofDomainEntity): Promise<PaymentProofDomainEntity>;

  /**
   * Deletes a payment proof by ID
   */
  delete(id: number): Promise<boolean>;

  /**
   * Finds payment proofs uploaded by a specific user
   */
  findByUserId(userId: number): Promise<PaymentProofDomainEntity[]>;

  /**
   * Finds payment proofs uploaded within a date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<PaymentProofDomainEntity[]>;

  /**
   * Checks if a reservation has any payment proofs
   */
  hasPaymentProofs(reservationId: number): Promise<boolean>;

  /**
   * Finds the latest payment proof for a reservation
   */
  findLatestByReservationId(reservationId: number): Promise<PaymentProofDomainEntity | null>;

  /**
   * Counts payment proofs for a reservation
   */
  countByReservationId(reservationId: number): Promise<number>;

  /**
   * Finds recent payment proofs (for notifications)
   */
  findRecentUploads(hours: number): Promise<PaymentProofDomainEntity[]>;

  /**
   * Validates file type and size before saving
   */
  validateFile(mimeType: string, fileSize: number): Promise<boolean>;
}