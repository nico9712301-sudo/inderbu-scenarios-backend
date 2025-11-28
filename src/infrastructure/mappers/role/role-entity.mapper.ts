import { RoleDomainEntity } from '../../../core/domain/entities/role.domain-entity';
import { RoleEntity } from '../../persistence/role.entity';

export class RoleEntityMapper {
  /**
   * Convierte de la entidad de persistencia a la entidad de dominio usando el builder
   */
  static toDomain(entity: RoleEntity): RoleDomainEntity {
    return RoleDomainEntity.builder()
      .withId(entity.id)
      .withName(entity.name)
      .withDescription(entity.description)
      .build();
  }

  /**
   * Convierte de la entidad de dominio a la entidad de persistencia
   */
  static toEntity(domain: RoleDomainEntity): RoleEntity {
    const entity = new RoleEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.description = domain.description;
    return entity;
  }
}
