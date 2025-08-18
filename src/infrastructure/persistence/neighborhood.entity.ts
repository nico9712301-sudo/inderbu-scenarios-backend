import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CommuneEntity } from './commune.entity';

@Entity('neighborhoods')
export class NeighborhoodEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => CommuneEntity)
  @JoinColumn({ name: 'fk_id_commune' })
  commune: CommuneEntity;

  @OneToMany(() => UserEntity, (user) => user.neighborhood)
  users: UserEntity[];
}
