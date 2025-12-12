import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SubScenarioEntity } from './sub-scenario.entity';

@Entity('sub_scenarios_prices')
export class SubScenarioPriceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fk_sub_scenario_id' })
  fkSubScenarioId: number;

  @Column({
    name: 'hourly_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Price per hour for this sub-scenario'
  })
  hourlyPrice: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SubScenarioEntity)
  @JoinColumn({ name: 'fk_sub_scenario_id' })
  subScenario: SubScenarioEntity;
}