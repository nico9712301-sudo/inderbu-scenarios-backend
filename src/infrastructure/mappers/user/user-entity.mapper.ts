import { UserEntity } from '../../persistence/user.entity';
import { UserDomainEntity } from '../../../core/domain/entities/user.domain-entity';
import { RoleEntity } from '../../persistence/role.entity';

export class UserEntityMapper {
  static toDomain(entity: UserEntity): UserDomainEntity {
    const domainEntity = UserDomainEntity.builder()
      .withId(entity.id)
      .withDni(entity.dni)
      .withFirstName(entity.first_name)
      .withLastName(entity.last_name)
      .withEmail(entity.email)
      .withPhone(entity.phone)
      .withPasswordHash(entity.password) // Se asume que en la entidad se guarda el hash
      .withRoleId(entity.role?.id) // Se asigna el ID del rol
      .withAddress(entity.address)
      .withNeighborhoodId(entity.neighborhood?.id)
      .withActive(entity.active)
      .withConfirmationToken(entity.confirmationToken)
      .withConfirmationTokenExpiresAt(entity.confirmationTokenExpiresAt)
      .build();

    // Preservamos las entidades relacionadas sin romper los principios de DDD
    // Estas propiedades no son parte formal del dominio pero son necesarias para el mapeo
    if (entity.role) {
      (domainEntity as any).role = entity.role;
    }
    if (entity.neighborhood) {
      (domainEntity as any).neighborhood = entity.neighborhood;
      if (entity.neighborhood.commune) {
        (domainEntity as any).commune = entity.neighborhood.commune;
        if (entity.neighborhood.commune.city) {
          (domainEntity as any).city = entity.neighborhood.commune.city;
        }
      }
    }

    return domainEntity;
  }

  static toEntity(domain: UserDomainEntity): UserEntity {
    const entity = new UserEntity();
    if (domain.id !== null) entity.id = domain.id;
    entity.dni = domain.dni;
    entity.first_name = domain.firstName;
    entity.last_name = domain.lastName;
    entity.email = domain.email;
    entity.phone = domain.phone;
    entity.password = (domain as any)['passwordHash'];
    entity.role = { id: domain.roleId } as RoleEntity;
    entity.address = domain.address;
    entity.neighborhood = { id: domain.neighborhoodId } as any;
    entity.active = domain.active;
    entity.confirmationToken = (domain as any).confirmationToken;
    entity.confirmationTokenExpiresAt = (
      domain as any
    ).confirmationTokenExpiresAt;
    return entity;
  }
}
