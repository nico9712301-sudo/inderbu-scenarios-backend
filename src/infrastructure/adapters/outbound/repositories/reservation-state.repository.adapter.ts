import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IReservationStateRepositoryPort } from 'src/core/domain/ports/outbound/reservation-state-repository.port';
import { ReservationStateEntity } from 'src/infrastructure/persistence/reservation-state.entity';
import { ReservationStateDomainEntity } from 'src/core/domain/entities/reservation-state.domain-entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';

@Injectable()
export class ReservationStateRepositoryAdapter
  extends BaseRepositoryAdapter<
    ReservationStateEntity,
    ReservationStateDomainEntity
  >
  implements IReservationStateRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.RESERVATION_STATE)
    repository: Repository<ReservationStateEntity>,
  ) {
    super(repository);
  }

  protected toEntity(
    domain: ReservationStateDomainEntity,
  ): ReservationStateEntity {
    return this.repository.create({ state: domain.name });
  }

  protected toDomain(
    entity: ReservationStateEntity,
  ): ReservationStateDomainEntity {
    return ReservationStateDomainEntity.builder()
      .withId(entity.id)
      .withName(entity.state)
      .build();
  }

  async findByName(name: string): Promise<ReservationStateDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { state: name },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<ReservationStateDomainEntity[]> {
    const entities = await this.repository.find({
      order: { id: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: number): Promise<ReservationStateDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }
}
