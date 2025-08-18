import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ITimeSlotRepositoryPort } from 'src/core/domain/ports/outbound/time-slot-repository.port';
import { TimeSlotEntity } from 'src/infrastructure/persistence/time-slot.entity';
import { TimeSlotDomainEntity } from 'src/core/domain/entities/time-slot.domain-entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';

@Injectable()
export class TimeSlotRepositoryAdapter
  extends BaseRepositoryAdapter<TimeSlotEntity, TimeSlotDomainEntity>
  implements ITimeSlotRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.TIME_SLOT)
    protected readonly repository: Repository<TimeSlotEntity>,
  ) {
    super(repository);
  }

  protected toEntity(domain: TimeSlotDomainEntity): TimeSlotEntity {
    return this.repository.create({
      startTime: domain.startTime,
      endTime: domain.endTime,
    });
  }

  protected toDomain(entity: TimeSlotEntity): TimeSlotDomainEntity {
    return TimeSlotDomainEntity.builder()
      .withId(entity.id)
      .withStartTime(entity.startTime)
      .withEndTime(entity.endTime)
      .build();
  }

  async findAll(): Promise<TimeSlotDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((e) => this.toDomain(e));
  }
}
