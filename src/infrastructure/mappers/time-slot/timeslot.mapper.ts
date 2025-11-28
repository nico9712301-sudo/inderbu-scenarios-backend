import { TimeSlotDomainEntity } from '../../../core/domain/entities/time-slot.domain-entity';
import { TimeslotResponseDto } from '../../adapters/inbound/http/dtos/time-slot/timeslot-response.dto';

export class TimeSlotMapper {
  static toDto(
    slot: TimeSlotDomainEntity,
    available: boolean,
  ): TimeslotResponseDto {
    return {
      id: slot.id!,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available,
    };
  }
}
