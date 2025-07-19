import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { NeighborhoodDomainEntity } from 'src/core/domain/entities/neighborhood.domain-entity';
import { ScenarioResponseDto } from 'src/infrastructure/adapters/inbound/http/dtos/scenario/scenario-response.dto';
import { NeighborhoodResponseMapper } from '../neighborhood/neighborhood-response.mapper';

export class ScenarioResponseMapper {
  static toDto(
    domain: ScenarioDomainEntity,
    neighborhoods?: Map<number, NeighborhoodDomainEntity>,
  ): ScenarioResponseDto {
    const dto: ScenarioResponseDto = {
      id: domain.id ?? 1,
      name: domain.name,
      address: domain.address,
      active: domain.active,
    };

    // Solo agregar neighborhood si está disponible
    if (domain.neighborhoodId && neighborhoods?.has(domain.neighborhoodId)) {
      dto.neighborhood = NeighborhoodResponseMapper.toDto(
        neighborhoods.get(domain.neighborhoodId)!,
      );
    }

    return dto;
  }
}
