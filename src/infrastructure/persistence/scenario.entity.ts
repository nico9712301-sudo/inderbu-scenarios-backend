import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { NeighborhoodEntity } from './neighborhood.entity'; // Asume que ya la tienes creada
import { SubScenarioEntity } from './sub-scenario.entity';

@Entity('scenarios')
@Index('ft_scen_name', ['name'], { fulltext: true })
export class ScenarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150 })
  address: string;

  @Column({
    name: 'active',
    default: true,
  })
  active?: boolean;

  // Relación con NeighborhoodEntity (similar a tu ejemplo de usuario)
  @ManyToOne(() => NeighborhoodEntity, { nullable: true })
  @JoinColumn({ name: 'fk_neighborhood_id' })
  neighborhood: NeighborhoodEntity;

  // Un escenario puede tener muchos sub-escenarios
  @OneToMany(() => SubScenarioEntity, (subScenario) => subScenario.scenario)
  subScenarios: SubScenarioEntity[];
}
