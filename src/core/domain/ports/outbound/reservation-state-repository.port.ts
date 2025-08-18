import { ReservationStateDomainEntity } from '../../entities/reservation-state.domain-entity';

export interface IReservationStateRepositoryPort {
  /**
   * Busca un estado de reserva por su nombre.
   */
  findByName(name: string): Promise<ReservationStateDomainEntity | null>;

  /**
   * Obtiene todos los estados de reserva.
   */
  findAll(): Promise<ReservationStateDomainEntity[]>;

  /**
   * Busca un estado de reserva por ID.
   */
  findById(id: number): Promise<ReservationStateDomainEntity | null>;
}
