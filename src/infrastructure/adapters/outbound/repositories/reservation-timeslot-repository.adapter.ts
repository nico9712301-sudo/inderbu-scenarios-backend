import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere, In } from 'typeorm';

import { IReservationTimeslotRepositoryPort } from 'src/core/domain/ports/outbound/reservation-timeslot-repository.port';
import { ReservationTimeslotEntityMapper } from 'src/infrastructure/mappers/reservation/reservation-timeslot-entity.mapper';
import { ReservationTimeslotDomainEntity } from 'src/core/domain/entities/reservation-timeslot.domain-entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { ReservationTimeslotEntity } from '../../../persistence/reservation-timeslot.entity';

const DEFAULT_RELATIONS = ['reservation', 'timeslot'] as const;

@Injectable()
export class ReservationTimeslotRepositoryAdapter
  extends BaseRepositoryAdapter<
    ReservationTimeslotEntity,
    ReservationTimeslotDomainEntity
  >
  implements IReservationTimeslotRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.RESERVATION_TIMESLOT)
    repository: Repository<ReservationTimeslotEntity>,
  ) {
    super(repository, [...DEFAULT_RELATIONS]);
  }

  protected toEntity(
    domain: ReservationTimeslotDomainEntity,
  ): ReservationTimeslotEntity {
    return ReservationTimeslotEntityMapper.toEntity(domain);
  }

  protected toDomain(
    entity: ReservationTimeslotEntity,
  ): ReservationTimeslotDomainEntity {
    return ReservationTimeslotEntityMapper.toDomain(entity);
  }

  async findByReservationId(
    reservationId: number,
  ): Promise<ReservationTimeslotDomainEntity[]> {
    const entities = await this.repository.find({
      where: { reservationId },
      relations: [...DEFAULT_RELATIONS],
      order: { timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByTimeslotIds(
    timeslotIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]> {
    if (timeslotIds.length === 0) return [];

    const entities = await this.repository.find({
      where: { timeslotId: In(timeslotIds) },
      relations: [...DEFAULT_RELATIONS],
      order: { timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async createMany(
    reservationId: number,
    timeslotIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]> {
    if (timeslotIds.length === 0) return [];

    const entities = timeslotIds.map((timeslotId) =>
      this.repository.create({
        reservationId,
        timeslotId,
      }),
    );

    const savedEntities = await this.repository.save(entities);

    // Recargar con relaciones
    const entitiesWithRelations = await this.repository.find({
      where: {
        reservationId,
        timeslotId: In(timeslotIds),
      },
      relations: [...DEFAULT_RELATIONS],
    });

    return entitiesWithRelations.map((entity) => this.toDomain(entity));
  }

  async deleteByReservationId(reservationId: number): Promise<void> {
    await this.repository.delete({ reservationId });
  }

  async findByTimeslotId(
    timeslotId: number,
  ): Promise<ReservationTimeslotDomainEntity[]> {
    const entities = await this.repository.find({
      where: { timeslotId },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByReservationIds(
    reservationIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]> {
    if (reservationIds.length === 0) return [];

    const entities = await this.repository.find({
      where: { reservationId: In(reservationIds) },
      relations: [...DEFAULT_RELATIONS],
      order: { reservationId: 'ASC', timeslotId: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async deleteByTimeslotId(timeslotId: number): Promise<void> {
    await this.repository.delete({ timeslotId });
  }

  async deleteByReservationIds(reservationIds: number[]): Promise<void> {
    if (reservationIds.length === 0) return;
    await this.repository.delete({ reservationId: In(reservationIds) });
  }

  async countByReservationId(reservationId: number): Promise<number> {
    return await this.repository.count({ where: { reservationId } });
  }

  async countByTimeslotId(timeslotId: number): Promise<number> {
    return await this.repository.count({ where: { timeslotId } });
  }

  async existsByReservationAndTimeslot(
    reservationId: number,
    timeslotId: number,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { reservationId, timeslotId },
    });
    return count > 0;
  }

  async findDuplicates(
    reservationId: number,
    timeslotIds: number[],
  ): Promise<ReservationTimeslotDomainEntity[]> {
    if (timeslotIds.length === 0) return [];

    const entities = await this.repository.find({
      where: {
        reservationId,
        timeslotId: In(timeslotIds),
      },
      relations: [...DEFAULT_RELATIONS],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async saveMany(
    reservationTimeslots: ReservationTimeslotDomainEntity[],
  ): Promise<ReservationTimeslotDomainEntity[]> {
    if (reservationTimeslots.length === 0) return [];

    const entities = reservationTimeslots.map((domain) =>
      this.toEntity(domain),
    );
    const savedEntities = await this.repository.save(entities);

    return savedEntities.map((entity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
