import { Expose } from 'class-transformer';

export enum NotificationTypeDomain {
  PAYMENT_PROOF_UPLOADED = 'payment_proof_uploaded',
  RECEIPT_GENERATED = 'receipt_generated',
  RECEIPT_SENT = 'receipt_sent',
}

export class NotificationDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly type: NotificationTypeDomain;

  @Expose()
  public readonly title: string;

  @Expose()
  public readonly message: string;

  @Expose()
  public readonly fkReservationId: number | null;

  @Expose()
  public readonly fkPaymentProofId: number | null;

  @Expose()
  public readonly fkReceiptId: number | null;

  @Expose()
  public readonly isRead: boolean;

  @Expose()
  public readonly readAt: Date | null;

  @Expose()
  public readonly createdAt: Date;

  @Expose()
  public readonly updatedAt: Date;

  private constructor(builder: NotificationDomainBuilder) {
    this.id = builder.id;
    this.type = builder.type;
    this.title = builder.title;
    this.message = builder.message;
    this.fkReservationId = builder.fkReservationId;
    this.fkPaymentProofId = builder.fkPaymentProofId;
    this.fkReceiptId = builder.fkReceiptId;
    this.isRead = builder.isRead;
    this.readAt = builder.readAt;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static buildFromBuilder(builder: NotificationDomainBuilder): NotificationDomainEntity {
    return new NotificationDomainEntity(builder);
  }

  static builder(): NotificationDomainBuilder {
    return new NotificationDomainBuilder();
  }

  /**
   * Checks if the notification is unread
   */
  isUnread(): boolean {
    return !this.isRead;
  }

  /**
   * Validates that the notification has required data
   */
  isValid(): boolean {
    return (
      this.title.length > 0 &&
      this.message.length > 0 &&
      Object.values(NotificationTypeDomain).includes(this.type)
    );
  }

  /**
   * Marks the notification as read
   */
  markAsRead(): NotificationDomainEntity {
    return NotificationDomainEntity.builder()
      .withId(this.id)
      .withType(this.type)
      .withTitle(this.title)
      .withMessage(this.message)
      .withFkReservationId(this.fkReservationId)
      .withFkPaymentProofId(this.fkPaymentProofId)
      .withFkReceiptId(this.fkReceiptId)
      .withIsRead(true)
      .withReadAt(new Date())
      .withCreatedAt(this.createdAt)
      .withUpdatedAt(new Date())
      .build();
  }

  /**
   * Gets the age of the notification in hours
   */
  getAgeInHours(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  /**
   * Checks if the notification is recent (less than 24 hours old)
   */
  isRecent(): boolean {
    return this.getAgeInHours() < 24;
  }

  /**
   * Creates a notification for payment proof uploaded
   */
  static createPaymentProofNotification(
    reservationId: number,
    paymentProofId: number
  ): NotificationDomainEntity {
    return NotificationDomainEntity.builder()
      .withType(NotificationTypeDomain.PAYMENT_PROOF_UPLOADED)
      .withTitle(`Nuevo comprobante de pago para reserva #${reservationId}`)
      .withMessage(`Se ha subido un nuevo comprobante de pago para la reserva #${reservationId}. Revisa y confirma la reserva.`)
      .withFkReservationId(reservationId)
      .withFkPaymentProofId(paymentProofId)
      .withIsRead(false)
      .build();
  }

  /**
   * Creates a notification for receipt generated
   */
  static createReceiptGeneratedNotification(
    reservationId: number,
    receiptId: number
  ): NotificationDomainEntity {
    return NotificationDomainEntity.builder()
      .withType(NotificationTypeDomain.RECEIPT_GENERATED)
      .withTitle(`Recibo generado para reserva #${reservationId}`)
      .withMessage(`Se ha generado un nuevo recibo para la reserva #${reservationId}.`)
      .withFkReservationId(reservationId)
      .withFkReceiptId(receiptId)
      .withIsRead(false)
      .build();
  }

  /**
   * Creates a notification for receipt sent
   */
  static createReceiptSentNotification(
    reservationId: number,
    receiptId: number,
    email: string
  ): NotificationDomainEntity {
    return NotificationDomainEntity.builder()
      .withType(NotificationTypeDomain.RECEIPT_SENT)
      .withTitle(`Recibo enviado para reserva #${reservationId}`)
      .withMessage(`Se ha enviado el recibo por correo electrónico a ${email} para la reserva #${reservationId}.`)
      .withFkReservationId(reservationId)
      .withFkReceiptId(receiptId)
      .withIsRead(false)
      .build();
  }
}

export class NotificationDomainBuilder {
  id: number | null = null;
  type: NotificationTypeDomain = NotificationTypeDomain.PAYMENT_PROOF_UPLOADED;
  title: string = '';
  message: string = '';
  fkReservationId: number | null = null;
  fkPaymentProofId: number | null = null;
  fkReceiptId: number | null = null;
  isRead: boolean = false;
  readAt: Date | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  withId(id: number | null): NotificationDomainBuilder {
    this.id = id;
    return this;
  }

  withType(type: NotificationTypeDomain): NotificationDomainBuilder {
    this.type = type;
    return this;
  }

  withTitle(title: string): NotificationDomainBuilder {
    this.title = title;
    return this;
  }

  withMessage(message: string): NotificationDomainBuilder {
    this.message = message;
    return this;
  }

  withFkReservationId(fkReservationId: number | null): NotificationDomainBuilder {
    this.fkReservationId = fkReservationId;
    return this;
  }

  withFkPaymentProofId(fkPaymentProofId: number | null): NotificationDomainBuilder {
    this.fkPaymentProofId = fkPaymentProofId;
    return this;
  }

  withFkReceiptId(fkReceiptId: number | null): NotificationDomainBuilder {
    this.fkReceiptId = fkReceiptId;
    return this;
  }

  withIsRead(isRead: boolean): NotificationDomainBuilder {
    this.isRead = isRead;
    return this;
  }

  withReadAt(readAt: Date | null): NotificationDomainBuilder {
    this.readAt = readAt;
    return this;
  }

  withCreatedAt(createdAt: Date): NotificationDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): NotificationDomainBuilder {
    this.updatedAt = updatedAt;
    return this;
  }

  build(): NotificationDomainEntity {
    return NotificationDomainEntity.buildFromBuilder(this);
  }
}