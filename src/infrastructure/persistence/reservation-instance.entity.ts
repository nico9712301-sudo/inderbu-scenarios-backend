import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  Index,
} from 'typeorm';
import { ReservationStateEntity } from './reservation-state.entity';
import { SubScenarioEntity } from './sub-scenario.entity';
import { ReservationEntity } from './reservation.entity';
import { TimeSlotEntity } from './time-slot.entity';
import { UserEntity } from './user.entity';

@Entity('reservation_instances')
@Unique(['subScenarioId', 'reservationDate', 'timeslotId'])
@Index(['reservationId'])
@Index(['subScenarioId', 'reservationDate', 'reservationStateId'])
@Index(['reservationDate', 'subScenarioId'])
@Index(['userId', 'reservationDate'])
export class ReservationInstanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservationId: number;

  @Column({ name: 'timeslot_id' })
  timeslotId: number;

  @Column({
    type: 'datetime',
    name: 'reservation_date',
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
  reservationDate: Date;

  // Campos denormalizados para consultas rápidas
  @Column({ name: 'sub_scenario_id' })
  subScenarioId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'reservation_state_id' })
  reservationStateId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ReservationEntity, (reservation) => reservation.instances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: ReservationEntity;

  @ManyToOne(() => TimeSlotEntity, { eager: false })
  @JoinColumn({ name: 'timeslot_id' })
  timeslot: TimeSlotEntity;

  @ManyToOne(() => SubScenarioEntity, { eager: false })
  @JoinColumn({ name: 'sub_scenario_id' })
  subScenario: SubScenarioEntity;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ReservationStateEntity, { eager: false })
  @JoinColumn({ name: 'reservation_state_id' })
  reservationState: ReservationStateEntity;
}
