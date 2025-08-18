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
import { ReservationEntity } from './reservation.entity';
import { TimeSlotEntity } from './time-slot.entity';

@Entity('reservation_timeslot')
@Unique(['reservationId', 'timeslotId'])
@Index(['reservationId'])
@Index(['timeslotId'])
export class ReservationTimeslotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservationId: number;

  @Column({ name: 'timeslot_id' })
  timeslotId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ReservationEntity, (reservation) => reservation.timeslots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: ReservationEntity;

  @ManyToOne(() => TimeSlotEntity, { eager: false })
  @JoinColumn({ name: 'timeslot_id' })
  timeslot: TimeSlotEntity;
}
