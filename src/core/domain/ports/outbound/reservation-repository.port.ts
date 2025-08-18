import { ReservationDomainEntity } from '../../entities/reservation.domain-entity';

export interface ReservationPageOptionsDto {
  page?: number;
  limit?: number;
  search?: string;
  subScenarioId?: number;
  userId?: number;
  reservationStateId?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  neighborhoodId?: number; // Heredado de PageOptionsDto
  cityId?: number;
  scenarioId?: number; // Heredado de PageOptionsDto
}

export interface IReservationRepositoryPort {
  save(reservation: ReservationDomainEntity): Promise<ReservationDomainEntity>;

  update(
    reservation: ReservationDomainEntity,
  ): Promise<ReservationDomainEntity>;

  findById(id: number): Promise<ReservationDomainEntity | null>;

  findByUserId(userId: number): Promise<ReservationDomainEntity[]>;

  findBySubScenarioId(
    subScenarioId: number,
  ): Promise<ReservationDomainEntity[]>;

  findBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationDomainEntity[]>;

  findPaged(
    options: ReservationPageOptionsDto,
  ): Promise<{ data: ReservationDomainEntity[]; total: number }>;

  findActiveBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationDomainEntity[]>;

  updateState(id: number, stateId: number): Promise<ReservationDomainEntity>;

  updateStateByIds(ids: number[], stateId: number): Promise<void>;

  delete(id: number): Promise<void>;

  countByUserId(userId: number): Promise<number>;

  countBySubScenarioId(subScenarioId: number): Promise<number>;

  findOverlappingReservations(
    subScenarioId: number,
    initialDate: Date,
    finalDate?: Date,
    weekDays?: number[],
    excludeReservationId?: number,
  ): Promise<ReservationDomainEntity[]>;
}
