import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubScenarioEntity } from './sub-scenario.entity';

@Entity('field_surface_types')
export class FieldSurfaceTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relaciones
  @OneToMany(
    () => SubScenarioEntity,
    (subScenario) => subScenario.fieldSurfaceType,
  )
  subScenarios?: SubScenarioEntity[];
}
