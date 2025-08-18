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
  name: string;

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'fk_modules_id' })
  module: ModuleEntity;

  @Column()
  fk_menu_item: number; // Auto-referencia o item padre
}
