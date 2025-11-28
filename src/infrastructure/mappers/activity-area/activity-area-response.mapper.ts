import { ActivityAreaDomainEntity } from '../../../core/domain/entities/activity-area.domain-entity';
import { ActivityAreaResponseDto } from '../../adapters/inbound/http/dtos/activity-area/activity-area-response.dto';

export class ActivityAreaResponseMapper {
  static toDto(d: ActivityAreaDomainEntity): ActivityAreaResponseDto {
    return { id: d.id!, name: d.name };
  }
}
