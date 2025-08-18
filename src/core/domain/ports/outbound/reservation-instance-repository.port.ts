import { ReservationInstanceDomainEntity } from '../../entities/reservation-instance.domain-entity';

export interface IReservationInstanceRepositoryPort {
  save(
    instance: ReservationInstanceDomainEntity,
  ): Promise<ReservationInstanceDomainEntity>;

  saveMany(
    instances: ReservationInstanceDomainEntity[],
  ): Promise<ReservationInstanceDomainEntity[]>;

  findById(id: number): Promise<ReservationInstanceDomainEntity | null>;

  findByReservationId(
    reservationId: number,
  ): Promise<ReservationInstanceDomainEntity[]>;

  findBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<ReservationInstanceDomainEntity[]>;

  findBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationInstanceDomainEntity[]>;

  findBySubScenarioDateAndTimeslot(
    subScenarioId: number,
    date: Date,
    timeslotId: number,
  ): Promise<ReservationInstanceDomainEntity | null>;

  findActiveBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<ReservationInstanceDomainEntity[]>;

  findActiveBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationInstanceDomainEntity[]>;

  findConflicts(
    subScenarioId: number,
    timeslotIds: number[],
    dates: Date[],
    excludeReservationId?: number,
  ): Promise<ReservationInstanceDomainEntity[]>;

  updateStateByReservationId(
    reservationId: number,
    stateId: number,
  ): Promise<void>;

  updateStateByReservationIds(
    reservationIds: number[],
    stateId: number,
  ): Promise<void>;

  deleteByReservationId(reservationId: number): Promise<void>;

  deleteByReservationIds(reservationIds: number[]): Promise<void>;

  delete(id: number): Promise<void>;

  countBySubScenarioAndDate(subScenarioId: number, date: Date): Promise<number>;

  countBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  countActiveBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<number>;

  getOccupiedTimeslotsByDate(
    subScenarioId: number,
    date: Date,
  ): Promise<number[]>;

  getOccupiedTimeslotsByDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, number[]>>;

  findByUserId(userId: number): Promise<ReservationInstanceDomainEntity[]>;

  findByUserIdAndDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationInstanceDomainEntity[]>;
}
