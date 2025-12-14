import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ReservationEntity } from './reservation.entity';
import { TemplateEntity } from './template.entity';
import { NotificationEntity } from './notification.entity';

@Entity('receipts')
export class ReceiptEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fk_reservation_id' })
  fkReservationId: number;

  @Column({ name: 'fk_template_id' })
  fkTemplateId: number;

  @Column({
    name: 'variables_values',
    type: 'json',
    comment: 'JSON object containing hourlyPrice and totalCost'
  })
  variablesValues: {
    hourlyPrice: number;
    totalCost: number;
  };

  @Column({
    name: 'generated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'When the receipt was generated'
  })
  generatedAt: Date;

  @Column({
    name: 'sent_at',
    type: 'timestamp',
    nullable: true,
    comment: 'When the receipt was sent via email'
  })
  sentAt: Date | null;

  @Column({
    name: 'sent_to_email',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Email address where the receipt was sent'
  })
  sentToEmail: string | null;

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

  @ManyToOne(() => TemplateEntity)
  @JoinColumn({ name: 'fk_template_id' })
  template: TemplateEntity;

  @OneToMany(() => NotificationEntity, (notification) => notification.receipt)
  notifications: NotificationEntity[];
}