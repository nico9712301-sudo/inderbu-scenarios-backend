import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ReservationEntity } from './reservation.entity';
import { UserEntity } from './user.entity';
import { NotificationEntity } from './notification.entity';

@Entity('payment_proofs')
export class PaymentProofEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fk_reservation_id' })
  fkReservationId: number;

  @Column({
    name: 'file_url',
    type: 'varchar',
    length: 500,
    comment: 'URL to the uploaded payment proof file in Cloudflare R2'
  })
  fileUrl: string;

  @Column({ name: 'uploaded_by_user_id' })
  uploadedByUserId: number;

  @Column({
    name: 'original_filename',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Original filename when uploaded'
  })
  originalFilename: string | null;

  @Column({
    name: 'file_size',
    type: 'bigint',
    nullable: true,
    comment: 'File size in bytes'
  })
  fileSize: number | null;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'MIME type of the uploaded file'
  })
  mimeType: string | null;

  @Column({
    name: 'uploaded_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'When the file was uploaded'
  })
  uploadedAt: Date;

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
  @ManyToOne(() => ReservationEntity)
  @JoinColumn({ name: 'fk_reservation_id' })
  reservation: ReservationEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser: UserEntity;

  @OneToMany(() => NotificationEntity, (notification) => notification.paymentProof)
  notifications: NotificationEntity[];
}