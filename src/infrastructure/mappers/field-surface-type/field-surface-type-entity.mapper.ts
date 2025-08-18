import { FieldSurfaceTypeDomainEntity } from 'src/core/domain/entities/field-surface-type.domain-entity';
import { FieldSurfaceTypeEntity } from 'src/infrastructure/persistence/field-surface-type.entity';

export class FieldSurfaceTypeEntityMapper {
  static toDomain(
    entity: FieldSurfaceTypeEntity,
  ): FieldSurfaceTypeDomainEntity {
    return new FieldSurfaceTypeDomainEntity(
      entity.id,
      entity.name,
      entity.createdAt,
    );
  }

  static toEntity(
    domain: FieldSurfaceTypeDomainEntity,
  ): FieldSurfaceTypeEntity {
    const entity = new FieldSurfaceTypeEntity();

    if (domain.id !== null) {
      entity.id = domain.id;
    }

    entity.name = domain.name;

    return entity;
  }
}
