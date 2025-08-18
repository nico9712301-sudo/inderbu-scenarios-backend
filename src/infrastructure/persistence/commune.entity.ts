import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CityEntity } from './city.entity';

@Entity('communes')
export class CommuneEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 150,
  })
  name: string;

  // Many to one relations
  @ManyToOne(() => CityEntity)
  @JoinColumn({ name: 'fk_id_city' })
  city: CityEntity;
}
