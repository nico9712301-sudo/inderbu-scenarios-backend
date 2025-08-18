import { ReservationTimeslotDomainEntity } from '../../entities/reservation-timeslot.domain-entity';

export interface IReservationTimeslotRepositoryPort {
  save(
    reservationTimeslot: ReservationTimeslotDomainEntity,
  ): Promise<ReservationTimeslotDomainEntity>;

  saveMany(
    reservationTimeslots: ReservationTimeslotDomainEntity[],
  ): Promise<ReservationTimeslotDomainEntity[]>;

  findById(id: number): Promise<ReservationTimeslotDomainEntity | null>;

  findByReservationId(
    reservationId: number,
  ): Promise<ReservationTimeslotDomainEntity[]>;

  findByTimeslotId(
    timeslotId: number,
  ): Promise<ReservationTimeslotDomainEntity[]>;

  findByReservationIds(
    reservationIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]>;

  findByTimeslotIds(
    timeslotIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]>;

  deleteByReservationId(reservationId: number): Promise<void>;

  deleteByTimeslotId(timeslotId: number): Promise<void>;

  deleteByReservationIds(reservationIds: number[]): Promise<void>;

  delete(id: number): Promise<void>;

  countByReservationId(reservationId: number): Promise<number>;

  countByTimeslotId(timeslotId: number): Promise<number>;

  existsByReservationAndTimeslot(
    reservationId: number,
    timeslotId: number,
  ): Promise<boolean>;

  findDuplicates(
    reservationId: number,
    timeslotIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]>;
}
