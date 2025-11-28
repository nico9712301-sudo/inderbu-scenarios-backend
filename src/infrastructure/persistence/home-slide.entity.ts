import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ModuleEntity } from './module.entity';
import { EntityEntity } from './entity.entity';

export enum SlideType {
  BANNER = 'banner',
  PLACEHOLDER = 'placeholder',
}

@Entity('home_slides')
export class HomeSlideEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder: number;

  @ManyToOne(() => ModuleEntity, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module: ModuleEntity | null;

  @ManyToOne(() => EntityEntity, { nullable: true })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityEntity | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: SlideType,
    default: SlideType.BANNER,
    name: 'slide_type',
  })
  slideType: SlideType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
