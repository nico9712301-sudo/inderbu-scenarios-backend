import { NeighborhoodDomainEntity } from '../../../core/domain/entities/neighborhood.domain-entity';
import { NeighborhoodResponseDto } from '../../adapters/inbound/http/dtos/neighborhood/neighborhood-response.dto';
import { CommuneResponseDto } from '../../adapters/inbound/http/dtos/commune/commune-response.dto';
import { CityResponseDto } from '../../adapters/inbound/http/dtos/city/city-response.dto';

export class NeighborhoodResponseMapper {
  static toDto(d: NeighborhoodDomainEntity): NeighborhoodResponseDto {
    let communeDto: CommuneResponseDto | undefined;

    if (d.commune) {
      let cityDto: CityResponseDto | undefined;

      if (d.commune.city) {
        cityDto = {
          id: d.commune.city.id!,
          name: d.commune.city.name,
        };
      }

      communeDto = {
        id: d.commune.id!,
        name: d.commune.name,
        city: cityDto,
      };
    }

    return {
      id: d.id!,
      name: d.name,
      commune: communeDto,
    };
  }
}
