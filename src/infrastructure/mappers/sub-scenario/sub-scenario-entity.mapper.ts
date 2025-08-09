import { SubScenarioEntity } from 'src/infrastructure/persistence/sub-scenario.entity';
import { SubScenarioDomainEntity } from 'src/core/domain/entities/sub-scenario.domain-entity';

export class SubScenarioEntityMapper {
  static toDomain(entity: SubScenarioEntity): SubScenarioDomainEntity {
    const domainEntity = SubScenarioDomainEntity.builder()
      .withId(entity.id)
      .withName(entity.name)
      .withActive(entity.active)
      .withHasCost(entity.hasCost)
      .withnumberOfSpectators(entity.numberOfSpectators)
      .withNumberOfPlayers(entity.numberOfPlayers)
      .withRecommendations(entity.recommendations)
      .withScenarioId(entity.scenario ? entity.scenario.id : 0)
      .withActivityAreaId(entity.activityArea ? entity.activityArea.id : 0)
      .withFieldSurfaceTypeId(entity.fieldSurfaceType ? entity.fieldSurfaceType.id : 0)
      .withCreatedAt(entity.createdAt)
      .build();
      
    // Preservamos las entidades relacionadas para la transformación a DTOs
    // Esta técnica permite mantener la información sin modificar el dominio
    if (entity.scenario) {
      (domainEntity as any).scenario = entity.scenario;
    }
    
    if (entity.activityArea) {
      (domainEntity as any).activityArea = entity.activityArea;
    }
    
    if (entity.fieldSurfaceType) {
      (domainEntity as any).fieldSurfaceType = entity.fieldSurfaceType;
    }
    
    if (entity.subScenarioPrices) {
      (domainEntity as any).subScenarioPrices = entity.subScenarioPrices;
    }
    
    return domainEntity;
  }

  static toEntity(domain: SubScenarioDomainEntity): SubScenarioEntity {
    const entity = new SubScenarioEntity();
    if (domain.id !== null) entity.id = domain.id;
    entity.name = domain.name;
    entity.active = domain.active;
    entity.hasCost = domain.hasCost;
    entity.numberOfSpectators = domain.numberOfSpectators ?? 0;
    entity.numberOfPlayers = domain.numberOfPlayers ?? 0;
    entity.recommendations = domain.recommendations ?? '';
    
    // Se crean instancias mínimas para las relaciones mediante el id
    if (domain.scenarioId) {
      entity.scenario = { id: domain.scenarioId } as any;
    }
    
    if (domain.activityAreaId) {
      entity.activityArea = { id: domain.activityAreaId } as any;
    }
    
    if (domain.fieldSurfaceTypeId) {
      entity.fieldSurfaceType = { id: domain.fieldSurfaceTypeId } as any;
    }
    
    return entity;
  }
}
