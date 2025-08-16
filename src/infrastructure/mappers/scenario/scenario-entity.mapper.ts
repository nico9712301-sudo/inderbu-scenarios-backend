import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { ScenarioEntity } from 'src/infrastructure/persistence/scenario.entity';

export class ScenarioEntityMapper {
  static toDomain(e: ScenarioEntity): ScenarioDomainEntity {
    return ScenarioDomainEntity.builder()
      .withId(e.id)
      .withName(e.name)
      .withAddress(e.address)
      .withNeighborhoodId(e.neighborhood?.id ?? 0)
      .withActive(e.active ?? true)
      .build();
  }
  static toEntity(domain: ScenarioDomainEntity): ScenarioEntity {
    const e = new ScenarioEntity();
    if (domain.id != null) e.id = domain.id;
    e.name = domain.name;
    e.address = domain.address;
    e.active = domain.active;
    if (domain.neighborhoodId != null) {
      e.neighborhood = { id: domain.neighborhoodId } as any;
    }
    return e;
  }
}
