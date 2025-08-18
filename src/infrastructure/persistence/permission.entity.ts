import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';
import { ModuleEntity } from './module.entity';
import { RoleEntity } from './role.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', width: 1 })
  can_create: number;

  @Column({ type: 'tinyint', width: 1 })
  can_edit: number;

  @Column({ type: 'tinyint', width: 1 })
  can_read: number;

  @Column({ type: 'tinyint', width: 1 })
  can_delete: number;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'fk_id_roles' })
  role: RoleEntity;

  @ManyToOne(() => MenuItemEntity)
  @JoinColumn({ name: 'fk_menu_items' })
  menuItem: MenuItemEntity;

  @ManyToOne(() => ModuleEntity)
  module: ModuleEntity;
}
