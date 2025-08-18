import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reservation_states')
export class ReservationStateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  state: string; // Ejemplo: PENDIENTE, CONFIRMADA, CANCELADA
}
