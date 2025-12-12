import { Expose } from 'class-transformer';

export class PaymentProofDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly fkReservationId: number;

  @Expose()
  public readonly fileUrl: string;

  @Expose()
  public readonly uploadedByUserId: number;

  @Expose()
  public readonly originalFilename: string | null;

  @Expose()
  public readonly fileSize: number | null;

  @Expose()
  public readonly mimeType: string | null;

  @Expose()
  public readonly uploadedAt: Date;

  @Expose()
  public readonly createdAt: Date;

  @Expose()
  public readonly updatedAt: Date;

  private constructor(builder: PaymentProofDomainBuilder) {
    this.id = builder.id;
    this.fkReservationId = builder.fkReservationId;
    this.fileUrl = builder.fileUrl;
    this.uploadedByUserId = builder.uploadedByUserId;
    this.originalFilename = builder.originalFilename;
    this.fileSize = builder.fileSize;
    this.mimeType = builder.mimeType;
    this.uploadedAt = builder.uploadedAt;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static buildFromBuilder(builder: PaymentProofDomainBuilder): PaymentProofDomainEntity {
    return new PaymentProofDomainEntity(builder);
  }

  static builder(): PaymentProofDomainBuilder {
    return new PaymentProofDomainBuilder();
  }

  /**
   * Validates that the payment proof data is complete and valid
   */
  isValid(): boolean {
    return (
      this.fkReservationId > 0 &&
      this.uploadedByUserId > 0 &&
      this.fileUrl.length > 0 &&
      this.uploadedAt instanceof Date
    );
  }

  /**
   * Checks if the file type is allowed for payment proofs
   */
  isValidFileType(): boolean {
    if (!this.mimeType) return false;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    return allowedTypes.includes(this.mimeType.toLowerCase());
  }

  /**
   * Checks if the file size is within acceptable limits (max 10MB)
   */
  isValidFileSize(): boolean {
    if (!this.fileSize) return true; // If no size info, assume it's valid

    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    return this.fileSize <= maxSize;
  }

  /**
   * Gets the file extension from the original filename or mime type
   */
  getFileExtension(): string {
    if (this.originalFilename) {
      const lastDot = this.originalFilename.lastIndexOf('.');
      if (lastDot !== -1) {
        return this.originalFilename.substring(lastDot + 1).toLowerCase();
      }
    }

    if (this.mimeType) {
      const mimeExtensions: { [key: string]: string } = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png'
      };
      return mimeExtensions[this.mimeType.toLowerCase()] || 'unknown';
    }

    return 'unknown';
  }

  /**
   * Formats the file size for display
   */
  getFormattedFileSize(): string {
    if (!this.fileSize) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Checks if all validations pass for business rules
   */
  isValidForBusiness(): boolean {
    return this.isValid() && this.isValidFileType() && this.isValidFileSize();
  }

  /**
   * Gets a safe filename for downloading
   */
  getSafeFilename(): string {
    const extension = this.getFileExtension();
    const reservationId = this.fkReservationId;
    const timestamp = this.uploadedAt.getTime();

    return `payment_proof_${reservationId}_${timestamp}.${extension}`;
  }
}

export class PaymentProofDomainBuilder {
  id: number | null = null;
  fkReservationId: number = 0;
  fileUrl: string = '';
  uploadedByUserId: number = 0;
  originalFilename: string | null = null;
  fileSize: number | null = null;
  mimeType: string | null = null;
  uploadedAt: Date = new Date();
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  withId(id: number | null): PaymentProofDomainBuilder {
    this.id = id;
    return this;
  }

  withFkReservationId(fkReservationId: number): PaymentProofDomainBuilder {
    this.fkReservationId = fkReservationId;
    return this;
  }

  withFileUrl(fileUrl: string): PaymentProofDomainBuilder {
    this.fileUrl = fileUrl;
    return this;
  }

  withUploadedByUserId(uploadedByUserId: number): PaymentProofDomainBuilder {
    this.uploadedByUserId = uploadedByUserId;
    return this;
  }

  withOriginalFilename(originalFilename: string | null): PaymentProofDomainBuilder {
    this.originalFilename = originalFilename;
    return this;
  }

  withFileSize(fileSize: number | null): PaymentProofDomainBuilder {
    this.fileSize = fileSize;
    return this;
  }

  withMimeType(mimeType: string | null): PaymentProofDomainBuilder {
    this.mimeType = mimeType;
    return this;
  }

  withUploadedAt(uploadedAt: Date): PaymentProofDomainBuilder {
    this.uploadedAt = uploadedAt;
    return this;
  }

  withCreatedAt(createdAt: Date): PaymentProofDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): PaymentProofDomainBuilder {
    this.updatedAt = updatedAt;
    return this;
  }

  build(): PaymentProofDomainEntity {
    return PaymentProofDomainEntity.buildFromBuilder(this);
  }
}