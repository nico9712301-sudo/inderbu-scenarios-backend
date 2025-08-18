import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

import { SubScenarioEntity } from './sub-scenario.entity';

@Entity('activity_areas')
@Index('ft_area_name', ['name'], { fulltext: true })
export class ActivityAreaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => SubScenarioEntity, (subScenario) => subScenario.activityArea)
  subScenarios: SubScenarioEntity[];
}
