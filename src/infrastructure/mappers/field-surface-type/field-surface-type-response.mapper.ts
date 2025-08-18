import { FieldSurfaceTypeDomainEntity } from 'src/core/domain/entities/field-surface-type.domain-entity';
import { FieldSurfaceTypeResponseDto } from 'src/infrastructure/adapters/inbound/http/dtos/field-surface-types/field-surface-type-response.dto';

export class FieldSurfaceTypeResponseMapper {
  static toDto(
    domain: FieldSurfaceTypeDomainEntity,
  ): FieldSurfaceTypeResponseDto {
    const dto = new FieldSurfaceTypeResponseDto();
    dto.id = domain.id!;
    dto.name = domain.name;
    return dto;
  }
}
