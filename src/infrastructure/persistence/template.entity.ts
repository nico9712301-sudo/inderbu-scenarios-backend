import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ReceiptEntity } from './receipt.entity';

export enum TemplateType {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  EMAIL = 'email',
}

@Entity('templates')
export class TemplateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: TemplateType,
    default: TemplateType.RECEIPT,
  })
  type: TemplateType;

  @Column({
    type: 'longtext',
    comment: 'JSON structure defining the template layout and components',
  })
  content: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number | null;

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
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity | null;

  @OneToMany(() => ReceiptEntity, (receipt) => receipt.template)
  receipts: ReceiptEntity[];
}