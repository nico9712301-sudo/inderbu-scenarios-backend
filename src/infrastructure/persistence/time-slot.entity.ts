import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('time_slots')
export class TimeSlotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;
}
