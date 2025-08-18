import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ModuleEntity } from './module.entity';

@Entity('menu_items')
export class MenuItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  path: string;

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'fk_modules_id' })
  module: ModuleEntity;

  @Column({
    nullable: true,
  })
  fk_menu_item: number; // Auto-referencia o item padre
}
