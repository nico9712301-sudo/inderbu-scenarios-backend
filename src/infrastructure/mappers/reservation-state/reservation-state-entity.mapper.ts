import { ReservationStateEntity } from '../../persistence/reservation-state.entity';
import { ReservationStateDomainEntity } from '../../../core/domain/entities/reservation-state.domain-entity';

export class ReservationStateEntityMapper {
  static toDomain(
    entity: ReservationStateEntity,
  ): ReservationStateDomainEntity {
    return ReservationStateDomainEntity.builder()
      .withId(entity.id)
      .withName(entity.state) // Conversion: entity.state -> domain.name
      .build();
  }

  static toEntity(
    domain: ReservationStateDomainEntity,
  ): ReservationStateEntity {
    const entity = new ReservationStateEntity();
    if (domain.id !== null) entity.id = domain.id;
    entity.state = domain.name; // Conversion: domain.name -> entity.state
    return entity;
  }
}
