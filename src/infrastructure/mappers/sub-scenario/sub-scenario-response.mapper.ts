import { SubScenarioDomainEntity } from '../../../core/domain/entities/sub-scenario.domain-entity';
import { SubScenarioResponseDto } from '../../adapters/inbound/http/dtos/sub-scenarios/sub-scenario-response.dto';

export class SubScenarioResponseMapper {
  static toDto(domain: SubScenarioDomainEntity): SubScenarioResponseDto {
    return {
      id: domain.id!,
      name: domain.name,
      hasCost: domain.hasCost,
      numberOfSpectators: domain.numberOfSpectators,
      numberOfPlayers: domain.numberOfPlayers,
      recommendations: domain.recommendations,
      scenarioId: domain.scenarioId,
      activityAreaId: domain.activityAreaId,
      fieldSurfaceTypeId: domain.fieldSurfaceTypeId,
      active: domain.active,
    };
  }
}
