import { TimeSlotDomainEntity } from '../../entities/time-slot.domain-entity';

export interface ITimeSlotRepositoryPort {
  findAll(): Promise<TimeSlotDomainEntity[]>;
}
