import { Injectable } from '@nestjs/common';
import { PaymentProofDomainEntity } from '../entities/payment-proof.domain-entity';
import { ReservationDomainEntity } from '../entities/reservation.domain-entity';

export interface PaymentValidationResult {
  isValid: boolean;
  reason?: string;
  requiresManualReview?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  reason?: string;
  detectedFileType?: string;
}

@Injectable()
export class PaymentValidationDomainService {
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MIN_FILE_SIZE = 1024; // 1KB

  /**
   * Validates if a payment proof file meets all requirements
   */
  validatePaymentProofFile(
    file: {
      mimeType: string;
      size: number;
      originalName?: string;
    },
  ): FileValidationResult {
    // Validate mime type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      return {
        isValid: false,
        reason: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP, PDF',
        detectedFileType: file.mimeType,
      };
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        reason: `El archivo es demasiado grande. Máximo permitido: ${this.formatFileSize(this.MAX_FILE_SIZE)}`,
      };
    }

    if (file.size < this.MIN_FILE_SIZE) {
      return {
        isValid: false,
        reason: 'El archivo es demasiado pequeño o está corrupto',
      };
    }

    // Validate file extension matches mime type
    if (file.originalName && !this.validateFileExtension(file.originalName, file.mimeType)) {
      return {
        isValid: false,
        reason: 'La extensión del archivo no coincide con el tipo de archivo detectado',
      };
    }

    return { isValid: true };
  }

  /**
   * Validates business rules for payment proof submission
   */
  validatePaymentProofSubmission(
    reservation: ReservationDomainEntity,
    totalCost: number,
    existingProofs: PaymentProofDomainEntity[],
  ): PaymentValidationResult {
    // Check if reservation is already confirmed
    if (reservation.confirmedAt) {
      return {
        isValid: false,
        reason: 'No se puede subir comprobante de pago para una reservación ya confirmada',
      };
    }

    // Check if reservation is cancelled
    // Check if reservation is cancelled - using state for now
    // if (reservation.status === 'cancelled') {
    //   return {
    //     isValid: false,
    //     reason: 'No se puede subir comprobante de pago para una reservación cancelada',
    //   };
    // }

    // Check if reservation is too old (more than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (reservation.createdAt && reservation.createdAt < thirtyDaysAgo) {
      return {
        isValid: false,
        reason: 'No se puede subir comprobante para reservaciones de más de 30 días de antigüedad',
      };
    }

    // Check if there are too many existing proofs (max 5 per reservation)
    if (existingProofs.length >= 5) {
      return {
        isValid: false,
        reason: 'Se ha alcanzado el límite máximo de comprobantes de pago para esta reservación',
      };
    }

    // Check if there's a recent upload (within 5 minutes)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const recentUpload = existingProofs.find(
      proof => proof.createdAt > fiveMinutesAgo,
    );

    if (recentUpload) {
      return {
        isValid: false,
        reason: 'Debe esperar al menos 5 minutos entre subidas de comprobantes',
      };
    }

    return { isValid: true };
  }

  /**
   * Determines if a payment proof needs manual review
   */
  requiresManualReview(
    paymentProof: PaymentProofDomainEntity,
    totalCost: number,
  ): boolean {
    // Always require review for high-value transactions
    if (totalCost > 5000) {
      return true;
    }

    // Require review for PDF files (harder to auto-validate)
    if (paymentProof.fileUrl.toLowerCase().endsWith('.pdf')) {
      return true;
    }

    // Require review if file is unusually large for an image
    const fileSizeFromUrl = this.estimateFileSizeFromUrl(paymentProof.fileUrl);
    if (fileSizeFromUrl > 5 * 1024 * 1024) { // > 5MB
      return true;
    }

    return false;
  }

  /**
   * Generates payment deadline for a reservation
   */
  calculatePaymentDeadline(reservationStartDate: Date): Date {
    const deadline = new Date(reservationStartDate);
    deadline.setHours(deadline.getHours() - 24); // 24 hours before
    return deadline;
  }

  /**
   * Checks if payment deadline has passed
   */
  hasPaymentDeadlinePassed(reservationStartDate: Date): boolean {
    const deadline = this.calculatePaymentDeadline(reservationStartDate);
    return new Date() > deadline;
  }

  /**
   * Validates payment amount matches expected cost
   */
  validatePaymentAmount(
    declaredAmount: number,
    expectedCost: number,
    tolerance: number = 0.01,
  ): PaymentValidationResult {
    const difference = Math.abs(declaredAmount - expectedCost);
    const toleranceAmount = expectedCost * tolerance;

    if (difference > toleranceAmount) {
      return {
        isValid: false,
        reason: `El monto declarado ($${declaredAmount}) no coincide con el costo esperado ($${expectedCost})`,
        requiresManualReview: true,
      };
    }

    return { isValid: true };
  }

  /**
   * Private helper methods
   */
  private validateFileExtension(fileName: string, mimeType: string): boolean {
    const extension = fileName.toLowerCase().split('.').pop();
    const mimeTypeMapping: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/pdf': ['pdf'],
    };

    const allowedExtensions = mimeTypeMapping[mimeType] || [];
    return extension ? allowedExtensions.includes(extension) : false;
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private estimateFileSizeFromUrl(url: string): number {
    // This is a placeholder - in a real implementation,
    // you might parse this from URL parameters or metadata
    return 0;
  }
}