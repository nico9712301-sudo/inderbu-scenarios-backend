import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ReservationTimeslotEntity } from './reservation-timeslot.entity';
import { ReservationInstanceEntity } from './reservation-instance.entity';
import { ReservationStateEntity } from './reservation-state.entity';
import { SubScenarioEntity } from './sub-scenario.entity';
import { UserEntity } from './user.entity';

@Entity('reservations')
@Index(['subScenarioId', 'initialDate', 'finalDate', 'reservationStateId'])
@Index(['userId', 'createdAt'])
@Index(['type', 'reservationStateId'])
export class ReservationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sub_scenario_id' })
  subScenarioId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['SINGLE', 'RANGE'],
    default: 'SINGLE',
  })
  type: string;

  @Column({
    type: 'datetime',
    name: 'initial_date',
    transformer: {
      to: (value: Date) => {
        const dateStr = value.toISOString().split('T')[0];
        return dateStr + 'T00:00:00Z';
      },
      from: (value: string) => {
        // Si viene como YYYY-MM-DD HH:mm:ss, extraer solo la fecha y forzar UTC 00:00:00
        return value;
      },
    },
  })
  initialDate: Date;

  @Column({
    type: 'datetime',
    name: 'final_date',
    nullable: true,
    transformer: {
      to: (value: Date | null) => {
        if (!value) return null;
        const dateStr = value.toISOString().split('T')[0];
        return dateStr + 'T00:00:00Z';
      },
      from: (value: string | null) => {
        // Si viene como YYYY-MM-DD HH:mm:ss, extraer solo la fecha y forzar UTC 00:00:00
        return value;
      },
    },
  })
  finalDate: Date | null;

  @Column({
    type: 'json',
    name: 'week_days',
    nullable: true,
  })
  weekDays: number[] | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  comments: string | null;

  @Column({ name: 'reservation_state_id', default: 1 })
  reservationStateId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SubScenarioEntity, { eager: false })
  @JoinColumn({ name: 'sub_scenario_id' })
  subScenario: SubScenarioEntity;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ReservationStateEntity, { eager: false })
  @JoinColumn({ name: 'reservation_state_id' })
  reservationState: ReservationStateEntity;

  @OneToMany(
    () => ReservationTimeslotEntity,
    (timeslot) => timeslot.reservation,
    { cascade: true },
  )
  timeslots: ReservationTimeslotEntity[];

  @OneToMany(
    () => ReservationInstanceEntity,
    (instance) => instance.reservation,
    { cascade: true },
  )
  instances: ReservationInstanceEntity[];
}
