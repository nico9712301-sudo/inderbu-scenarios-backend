import { CommuneDomainEntity } from '../../../core/domain/entities/commune.domain-entity';
import { CommuneResponseDto } from '../../adapters/inbound/http/dtos/commune/commune-response.dto';

export class CommuneResponseMapper {
  static toDto(d: CommuneDomainEntity): CommuneResponseDto {
    return {
      id: d.id!,
      name: d.name,
      city: d.city
        ? {
            id: d.city.id!,
            name: d.city.name,
          }
        : undefined,
    };
  }
}
