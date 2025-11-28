import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere, In, Between, Not } from 'typeorm';

import { IReservationInstanceRepositoryPort } from '../../../../core/domain/ports/outbound/reservation-instance-repository.port';
import { ReservationInstanceEntityMapper } from '../../../mappers/reservation/reservation-instance-entity.mapper';
import { ReservationInstanceDomainEntity } from '../../../../core/domain/entities/reservation-instance.domain-entity';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { ReservationInstanceEntity } from '../../../persistence/reservation-instance.entity';

const DEFAULT_RELATIONS = [
  'reservation',
  'timeslot',
  'subScenario',
  'user',
  'reservationState',
] as const;

@Injectable()
export class ReservationInstanceRepositoryAdapter
  extends BaseRepositoryAdapter<
    ReservationInstanceEntity,
    ReservationInstanceDomainEntity
  >
  implements IReservationInstanceRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.RESERVATION_INSTANCE)
    repository: Repository<ReservationInstanceEntity>,
  ) {
    super(repository, [...DEFAULT_RELATIONS]);
  }

  protected toEntity(
    domain: ReservationInstanceDomainEntity,
  ): ReservationInstanceEntity {
    return ReservationInstanceEntityMapper.toEntity(domain);
  }

  protected toDomain(
    entity: ReservationInstanceEntity,
  ): ReservationInstanceDomainEntity {
    return ReservationInstanceEntityMapper.toDomain(entity);
  }

  async findByReservationId(
    reservationId: number,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: { reservationId },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'ASC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findConflicts(
    subScenarioId: number,
    timeslotIds: number[],
    dates: Date[],
    excludeReservationId?: number,
  ): Promise<ReservationInstanceDomainEntity[]> {
    if (dates.length === 0 || timeslotIds.length === 0) return [];

    let whereCondition: FindOptionsWhere<ReservationInstanceEntity> = {
      subScenarioId,
      reservationDate: In(dates),
      timeslotId: In(timeslotIds),
      reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
    };

    if (excludeReservationId) {
      whereCondition = {
        ...whereCondition,
        reservationId: Not(excludeReservationId),
      };
    }

    const entities = await this.repository.find({
      where: whereCondition,
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'ASC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findAvailableTimeslots(
    subScenarioId: number,
    date: Date,
    allTimeslotIds: number[],
  ): Promise<number[]> {
    if (allTimeslotIds.length === 0) return [];

    const occupiedInstances = await this.repository.find({
      where: {
        subScenarioId,
        reservationDate: date,
        timeslotId: In(allTimeslotIds),
        reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
      },
      select: ['timeslotId'],
    });

    const occupiedTimeslotIds = occupiedInstances.map(
      (instance) => instance.timeslotId,
    );
    return allTimeslotIds.filter((id) => !occupiedTimeslotIds.includes(id));
  }

  async createMany(
    instances: Partial<ReservationInstanceEntity>[],
  ): Promise<ReservationInstanceDomainEntity[]> {
    if (instances.length === 0) return [];

    const entities = instances.map((instance) =>
      this.repository.create(instance),
    );
    const savedEntities = await this.repository.save(entities);

    // Recargar con relaciones
    const entitiesWithRelations = await this.repository.find({
      where: {
        id: In(savedEntities.map((e) => e.id)),
      },
      relations: [...DEFAULT_RELATIONS],
    });

    return entitiesWithRelations.map((entity) => this.toDomain(entity));
  }

  async deleteByReservationId(reservationId: number): Promise<void> {
    await this.repository.delete({ reservationId });
  }

  async updateStatesByReservationId(
    reservationId: number,
    stateId: number,
  ): Promise<void> {
    await this.repository.update(
      { reservationId },
      {
        reservationStateId: stateId,
        // No podemos actualizar createdAt aquí porque es automático
      },
    );
  }

  async findByDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
    stateIds?: number[],
  ): Promise<ReservationInstanceDomainEntity[]> {
    const whereCondition: FindOptionsWhere<ReservationInstanceEntity> = {
      subScenarioId,
      reservationDate: Between(startDate, endDate),
    };

    if (stateIds && stateIds.length > 0) {
      whereCondition.reservationStateId = In(stateIds);
    }

    const entities = await this.repository.find({
      where: whereCondition,
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'ASC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: { subScenarioId, reservationDate: date },
      relations: [...DEFAULT_RELATIONS],
      order: { timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: {
        subScenarioId,
        reservationDate: Between(startDate, endDate),
      },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'ASC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findBySubScenarioDateAndTimeslot(
    subScenarioId: number,
    date: Date,
    timeslotId: number,
  ): Promise<ReservationInstanceDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { subScenarioId, reservationDate: date, timeslotId },
      relations: [...DEFAULT_RELATIONS],
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findActiveBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: {
        subScenarioId,
        reservationDate: date,
        reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
      },
      relations: [...DEFAULT_RELATIONS],
      order: { timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: {
        subScenarioId,
        reservationDate: Between(startDate, endDate),
        reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
      },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'ASC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async updateStateByReservationId(
    reservationId: number,
    stateId: number,
  ): Promise<void> {
    await this.repository.update(
      { reservationId },
      { reservationStateId: stateId },
    );
  }

  async updateStateByReservationIds(
    reservationIds: number[],
    stateId: number,
  ): Promise<void> {
    if (reservationIds.length === 0) return;

    await this.repository.update(
      { reservationId: In(reservationIds) },
      { reservationStateId: stateId },
    );
  }

  async deleteByReservationIds(reservationIds: number[]): Promise<void> {
    if (reservationIds.length === 0) return;
    await this.repository.delete({ reservationId: In(reservationIds) });
  }

  async countBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<number> {
    return await this.repository.count({
      where: { subScenarioId, reservationDate: date },
    });
  }

  async countBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return await this.repository.count({
      where: {
        subScenarioId,
        reservationDate: Between(startDate, endDate),
      },
    });
  }

  async countActiveBySubScenarioAndDate(
    subScenarioId: number,
    date: Date,
  ): Promise<number> {
    return await this.repository.count({
      where: {
        subScenarioId,
        reservationDate: date,
        reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
      },
    });
  }

  async getOccupiedTimeslotsByDate(
    subScenarioId: number,
    date: Date,
  ): Promise<number[]> {
    const instances = await this.repository.find({
      where: {
        subScenarioId,
        reservationDate: date,
        reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
      },
      select: ['timeslotId'],
    });

    return instances.map((instance) => instance.timeslotId);
  }

  async getOccupiedTimeslotsByDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, number[]>> {
    const instances: ReservationInstanceEntity[] = await this.repository.find({
      where: {
        subScenarioId,
        reservationDate: Between(startDate, endDate),
        reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
      },
      select: ['reservationDate', 'timeslotId'],
    });

    const occupiedMap = new Map<string, number[]>();

    //Mostrar la consulta hecha con instances
    console.log('Instances:', instances);

    instances.forEach((instance) => {
      // ✅ Ahora que las fechas se crean correctamente, esto funcionará bien
      const dateKey = instance.reservationDate.toISOString().split('T')[0];
      const existing = occupiedMap.get(dateKey) || [];
      existing.push(instance.timeslotId);
      occupiedMap.set(dateKey, existing);
    });

    // log occupiedMap for debugging
    console.log('Occupied Timeslots Map:', Array.from(occupiedMap.entries()));

    return occupiedMap;
  }

  async findByUserId(
    userId: number,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: { userId },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'DESC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByUserIdAndDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationInstanceDomainEntity[]> {
    const entities = await this.repository.find({
      where: {
        userId,
        reservationDate: Between(startDate, endDate),
      },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationDate: 'DESC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async saveMany(
    instances: ReservationInstanceDomainEntity[],
  ): Promise<ReservationInstanceDomainEntity[]> {
    if (instances.length === 0) return [];

    const entities = instances.map((domain) => this.toEntity(domain));
    const savedEntities = await this.repository.save(entities);

    return savedEntities.map((entity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
