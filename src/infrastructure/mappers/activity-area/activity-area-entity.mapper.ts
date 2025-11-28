import { ActivityAreaDomainEntity } from '../../../core/domain/entities/activity-area.domain-entity';
import { ActivityAreaEntity } from '../../persistence/activity-area.entity';

export class ActivityAreaEntityMapper {
  static toDomain(e: ActivityAreaEntity): ActivityAreaDomainEntity {
    return ActivityAreaDomainEntity.builder()
      .withId(e.id)
      .withName(e.name)
      .build();
  }

  static toEntity(d: ActivityAreaDomainEntity): ActivityAreaEntity {
    const e = new ActivityAreaEntity();
    if (d.id) e.id = d.id;
    e.name = d.name;
    return e;
  }
}
