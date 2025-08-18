import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { NeighborhoodEntity } from './neighborhood.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dni: number;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100 })
  password: string;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'fk_role_id' })
  role: RoleEntity;

  @Column({ length: 150 })
  address: string;

  @ManyToOne(() => NeighborhoodEntity)
  @JoinColumn({ name: 'fk_id_neighborhood' })
  neighborhood: NeighborhoodEntity;

  @Column({ default: false })
  active: boolean;

  @Column({ length: 128, nullable: true })
  confirmationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmationTokenExpiresAt: Date;
}
