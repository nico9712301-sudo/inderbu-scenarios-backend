import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReservationEntity } from './reservation.entity';
import { PaymentProofEntity } from './payment-proof.entity';
import { ReceiptEntity } from './receipt.entity';

export enum NotificationType {
  PAYMENT_PROOF_UPLOADED = 'payment_proof_uploaded',
  RECEIPT_GENERATED = 'receipt_generated',
  RECEIPT_SENT = 'receipt_sent',
}

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    length: 255,
    comment: 'Notification title for admin interface'
  })
  title: string;

  @Column({
    type: 'text',
    comment: 'Detailed notification message'
  })
  message: string;

  @Column({ name: 'fk_reservation_id', nullable: true })
  fkReservationId: number | null;

  @Column({ name: 'fk_payment_proof_id', nullable: true })
  fkPaymentProofId: number | null;

  @Column({ name: 'fk_receipt_id', nullable: true })
  fkReceiptId: number | null;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
    comment: 'Whether the notification has been read by admin'
  })
  isRead: boolean;

  @Column({
    name: 'read_at',
    type: 'timestamp',
    nullable: true,
    comment: 'When the notification was marked as read'
  })
  readAt: Date | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ReservationEntity, { nullable: true })
  @JoinColumn({ name: 'fk_reservation_id' })
  reservation: ReservationEntity | null;

  @ManyToOne(() => PaymentProofEntity, { nullable: true })
  @JoinColumn({ name: 'fk_payment_proof_id' })
  paymentProof: PaymentProofEntity | null;

  @ManyToOne(() => ReceiptEntity, { nullable: true })
  @JoinColumn({ name: 'fk_receipt_id' })
  receipt: ReceiptEntity | null;
}