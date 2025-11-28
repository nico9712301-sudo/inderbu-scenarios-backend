import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere, Between, In, Like } from 'typeorm';

import { ReservationPageOptionsDto } from '../../../../core/domain/ports/outbound/reservation-repository.port';
import { IReservationRepositoryPort } from '../../../../core/domain/ports/outbound/reservation-repository.port';
import { ReservationEntityMapper } from '../../../mappers/reservation/reservation-entity.mapper';
import { ReservationDomainEntity } from '../../../../core/domain/entities/reservation.domain-entity';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { ReservationEntity } from '../../../persistence/reservation.entity';

const DEFAULT_RELATIONS = [
  'subScenario',
  'subScenario.scenario',
  'subScenario.scenario.neighborhood',
  'subScenario.scenario.neighborhood.commune',
  'subScenario.scenario.neighborhood.commune.city',
  'user',
  'reservationState',
  'timeslots',
  'timeslots.timeslot',
  'instances',
  'instances.timeslot',
] as const;

@Injectable()
export class ReservationRepositoryAdapter
  extends BaseRepositoryAdapter<ReservationEntity, ReservationDomainEntity>
  implements IReservationRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.RESERVATION)
    repository: Repository<ReservationEntity>,
  ) {
    super(repository, [...DEFAULT_RELATIONS]);
  }

  protected toEntity(domain: ReservationDomainEntity): ReservationEntity {
    return ReservationEntityMapper.toEntity(domain);
  }

  protected toDomain(entity: ReservationEntity): ReservationDomainEntity {
    return ReservationEntityMapper.toDomain(entity);
  }

  async findPaged(
    pageOptionsDto: ReservationPageOptionsDto,
  ): Promise<{ data: ReservationDomainEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      subScenarioId,
      userId,
      reservationStateId,
      type,
      dateFrom,
      dateTo,
      neighborhoodId, // From PageOptionsDto base class
      cityId,
      scenarioId, // From PageOptionsDto base class
    } = pageOptionsDto;
    const skip = (page - 1) * limit;

    // Use QueryBuilder for complex filtering with JOINs
    const queryBuilder = this.repository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.subScenario', 'subScenario')
      .leftJoinAndSelect('subScenario.scenario', 'scenario')
      .leftJoinAndSelect('scenario.neighborhood', 'neighborhood')
      .leftJoinAndSelect('neighborhood.commune', 'commune')
      .leftJoinAndSelect('commune.city', 'city')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.reservationState', 'reservationState')
      .leftJoinAndSelect('reservation.timeslots', 'timeslots')
      .leftJoinAndSelect('timeslots.timeslot', 'timeslot')
      .leftJoinAndSelect('reservation.instances', 'instances')
      .leftJoinAndSelect('instances.timeslot', 'instanceTimeslot');

    if (search) {
      queryBuilder.andWhere('reservation.comments LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (subScenarioId) {
      queryBuilder.andWhere('reservation.subScenarioId = :subScenarioId', {
        subScenarioId,
      });
    }

    if (userId) {
      queryBuilder.andWhere('reservation.userId = :userId', { userId });
    }

    if (reservationStateId) {
      queryBuilder.andWhere(
        'reservation.reservationStateId = :reservationStateId',
        { reservationStateId },
      );
    }

    if (type) {
      queryBuilder.andWhere('reservation.type = :type', { type });
    }

    if (dateFrom && dateTo) {
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      queryBuilder.andWhere(
        'reservation.initialDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    // NEW: Filter by neighborhoodId
    if (neighborhoodId) {
      queryBuilder.andWhere('neighborhood.id = :neighborhoodId', {
        neighborhoodId,
      });
    }

    // NEW: Filter by cityId
    if (cityId) {
      queryBuilder.andWhere('city.id = :cityId', { cityId });
    }

    // NEW: Filter by scenarioId
    if (scenarioId) {
      queryBuilder.andWhere('scenario.id = :scenarioId', { scenarioId });
    }

    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('reservation.createdAt', 'DESC');

    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      data: entities.map((entity) => this.toDomain(entity)),
      total,
    };
  }

  async findWithTimeslots(id: number): Promise<ReservationDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: [...DEFAULT_RELATIONS],
    });

    return entity ? this.toDomain(entity) : null;
  }

  async updateState(
    id: number,
    stateId: number,
  ): Promise<ReservationDomainEntity> {
    await this.repository.update(id, {
      reservationStateId: stateId,
      updatedAt: new Date(),
    });

    const updated = await this.findWithTimeslots(id);
    if (!updated) {
      throw new Error(`Reservation with id ${id} not found after update`);
    }

    return updated;
  }

  async findByUserId(userId: number): Promise<ReservationDomainEntity[]> {
    const entities = await this.repository.find({
      where: { userId },
      relations: [...DEFAULT_RELATIONS],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findBySubScenarioId(
    subScenarioId: number,
  ): Promise<ReservationDomainEntity[]> {
    const entities = await this.repository.find({
      where: { subScenarioId },
      relations: [...DEFAULT_RELATIONS],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationDomainEntity[]> {
    const entities = await this.repository.find({
      where: [
        {
          subScenarioId,
          type: 'SINGLE',
          initialDate: Between(startDate, endDate),
        },
        {
          subScenarioId,
          type: 'RANGE',
          initialDate: Between(startDate, endDate),
        },
        {
          subScenarioId,
          type: 'RANGE',
          finalDate: Between(startDate, endDate),
        },
      ],
      relations: [...DEFAULT_RELATIONS],
      order: { initialDate: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveBySubScenarioAndDateRange(
    subScenarioId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<ReservationDomainEntity[]> {
    const entities = await this.repository.find({
      where: [
        {
          subScenarioId,
          type: 'SINGLE',
          initialDate: Between(startDate, endDate),
          reservationStateId: In([1, 2]), // PENDIENTE, CONFIRMADA
        },
        {
          subScenarioId,
          type: 'RANGE',
          initialDate: Between(startDate, endDate),
          reservationStateId: In([1, 2]),
        },
        {
          subScenarioId,
          type: 'RANGE',
          finalDate: Between(startDate, endDate),
          reservationStateId: In([1, 2]),
        },
      ],
      relations: [...DEFAULT_RELATIONS],
      order: { initialDate: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async updateStateByIds(ids: number[], stateId: number): Promise<void> {
    if (ids.length === 0) return;

    await this.repository.update(
      { id: In(ids) },
      {
        reservationStateId: stateId,
        updatedAt: new Date(),
      },
    );
  }

  async countByUserId(userId: number): Promise<number> {
    return await this.repository.count({ where: { userId } });
  }

  async countBySubScenarioId(subScenarioId: number): Promise<number> {
    return await this.repository.count({ where: { subScenarioId } });
  }

  async findOverlappingReservations(
    subScenarioId: number,
    initialDate: Date,
    finalDate?: Date,
    weekDays?: number[],
    excludeReservationId?: number,
  ): Promise<ReservationDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.subScenario', 'subScenario')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.reservationState', 'reservationState')
      .leftJoinAndSelect('reservation.timeslots', 'timeslots')
      .leftJoinAndSelect('timeslots.timeslot', 'timeslot')
      .leftJoinAndSelect('reservation.instances', 'instances')
      .leftJoinAndSelect('instances.timeslot', 'instanceTimeslot')
      .where('reservation.subScenarioId = :subScenarioId', { subScenarioId })
      .andWhere('reservation.reservationStateId IN (1, 2)'); // PENDIENTE, CONFIRMADA

    if (excludeReservationId) {
      queryBuilder.andWhere('reservation.id != :excludeReservationId', {
        excludeReservationId,
      });
    }

    // Para reservas de tipo SINGLE
    if (!finalDate) {
      queryBuilder.andWhere(
        '(reservation.type = :singleType AND reservation.initialDate = :initialDate)',
        { singleType: 'SINGLE', initialDate },
      );
    } else {
      // Para reservas de tipo RANGE
      queryBuilder.andWhere(
        '((reservation.type = :singleType AND reservation.initialDate BETWEEN :initialDate AND :finalDate) OR ' +
          '(reservation.type = :rangeType AND (' +
          '  (reservation.initialDate <= :finalDate AND reservation.finalDate >= :initialDate)' +
          ')))',
        {
          singleType: 'SINGLE',
          rangeType: 'RANGE',
          initialDate,
          finalDate,
        },
      );
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async update(
    reservation: ReservationDomainEntity,
  ): Promise<ReservationDomainEntity> {
    const entity = this.toEntity(reservation);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
