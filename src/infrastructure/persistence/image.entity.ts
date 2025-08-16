import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { SubScenarioEntity } from './sub-scenario.entity';

@Entity('sub_scenario_images')
export class SubScenarioImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  path: string;

  @Column({ type: 'boolean', default: false })
  isFeature: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  current: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relación con SubScenarioEntity
  @ManyToOne(() => SubScenarioEntity, (subScenario) => subScenario.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_sub_scenario_id' })
  subScenario: SubScenarioEntity;
}
