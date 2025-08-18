import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';
import { PermissionEntity } from './permission.entity';

@Entity('modules')
export class ModuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @OneToMany(() => MenuItemEntity, (menuItem) => menuItem.module)
  menuItems: MenuItemEntity[];

  @OneToMany(() => PermissionEntity, (permission) => permission.module)
  permissions: PermissionEntity[];
}
