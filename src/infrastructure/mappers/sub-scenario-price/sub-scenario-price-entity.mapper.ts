import { SubScenarioPriceDomainEntity } from '../../../core/domain/entities/sub-scenario-price.domain-entity';
import { SubScenarioPriceEntity } from '../../persistence/sub-scenario-price.entity';

export class SubScenarioPriceEntityMapper {
  /**
   * Convierte de la entidad de persistencia a la entidad de dominio usando el builder
   */
  static toDomain(entity: SubScenarioPriceEntity): SubScenarioPriceDomainEntity {
    return SubScenarioPriceDomainEntity.builder()
      .withId(entity.id)
      .withFkSubScenarioId(entity.fkSubScenarioId)
      .withHourlyPrice(Number(entity.hourlyPrice)) // Ensure decimal is converted to number
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();
  }

  /**
   * Convierte de la entidad de dominio a la entidad de persistencia
   */
  static toEntity(domain: SubScenarioPriceDomainEntity): SubScenarioPriceEntity {
    const entity = new SubScenarioPriceEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.fkSubScenarioId = domain.fkSubScenarioId;
    entity.hourlyPrice = domain.hourlyPrice;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Convierte un array de entidades de persistencia a entidades de dominio
   */
  static toDomainArray(entities: SubScenarioPriceEntity[]): SubScenarioPriceDomainEntity[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Convierte un array de entidades de dominio a entidades de persistencia
   */
  static toEntityArray(domains: SubScenarioPriceDomainEntity[]): SubScenarioPriceEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }
}