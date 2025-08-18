import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubScenarioEntity } from './sub-scenario.entity';

@Entity('sub_scenarios_prices')
export class SubScenarioPriceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con SubScenarioEntity
  @ManyToOne(
    () => SubScenarioEntity,
    (subScenario) => subScenario.subScenarioPrices,
    {
      onDelete: 'CASCADE', // si deseas que se eliminen en cascada
    },
  )
  @JoinColumn({ name: 'fk_sub_scenario_id' })
  subScenario: SubScenarioEntity;

  // Precio
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
