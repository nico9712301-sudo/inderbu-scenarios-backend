import { TimeSlotDomainEntity } from 'src/core/domain/entities/time-slot.domain-entity';

export interface ITimeSlotRepositoryPort {
  findAll(): Promise<TimeSlotDomainEntity[]>;
}
