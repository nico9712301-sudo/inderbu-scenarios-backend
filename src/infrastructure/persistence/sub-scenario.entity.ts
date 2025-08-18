import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ScenarioEntity } from './scenario.entity';
import { SubScenarioPriceEntity } from './sub-scenario-price.entity';
import { FieldSurfaceTypeEntity } from './field-surface-type.entity';
import { ActivityAreaEntity } from './activity-area.entity';
import { SubScenarioImageEntity } from './image.entity';

@Entity('sub_scenarios')
@Index('ft_sub_name', ['name'], { fulltext: true })
export class SubScenarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Indica si es de pago (hasCost)
  @Column({ type: 'boolean', default: false })
  hasCost: boolean;

  @Column({ type: 'int', nullable: true })
  numberOfSpectators: number;

  @Column({ type: 'int', nullable: true })
  numberOfPlayers: number;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  // Relación con ScenarioEntity
  @ManyToOne(() => ScenarioEntity, (scenario) => scenario.subScenarios, {
    onDelete: 'CASCADE', // Opcional: define qué pasa si se borra el escenario
  })
  @JoinColumn({ name: 'fk_scenario_id' })
  scenario: ScenarioEntity;

  // Relación con ActivityAreaEntity
  @ManyToOne(
    () => ActivityAreaEntity,
    (activityArea) => activityArea.subScenarios,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'fk_activity_area_id' })
  activityArea: ActivityAreaEntity;

  // Relación con FieldSurfaceTypeEntity
  @ManyToOne(
    () => FieldSurfaceTypeEntity,
    (fieldSurfaceType) => fieldSurfaceType.subScenarios,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'fk_field_surface_type_id' })
  fieldSurfaceType: FieldSurfaceTypeEntity;

  // Relación con SubScenarioPriceEntity
  @OneToMany(
    () => SubScenarioPriceEntity,
    (subScenarioPrice) => subScenarioPrice.subScenario,
  )
  subScenarioPrices: SubScenarioPriceEntity[];

  // Relación con SubScenarioImageEntity
  @OneToMany(() => SubScenarioImageEntity, (image) => image.subScenario)
  images: SubScenarioImageEntity[];
}
