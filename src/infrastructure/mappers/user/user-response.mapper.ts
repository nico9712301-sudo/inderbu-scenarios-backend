import { plainToInstance } from 'class-transformer';

import { UserWithRelationsDto } from '../../adapters/inbound/http/dtos/user/user-with-relations.dto';
import { UserResponseDto } from '../../adapters/inbound/http/dtos/user/create-user-response.dto';
import { UserDomainEntity } from '../../../core/domain/entities/user.domain-entity';

export class UserResponseMapper {
  static toDto(domain: UserDomainEntity): UserResponseDto {
    console.log('you know', {
      id: domain.id,
      dni: domain.dni,
      firstName: domain.firstName,
      lastName: domain.lastName,
      email: domain.email,
      phone: domain.phone,
      roleId: domain.roleId,
      address: domain.address,
      neighborhoodId: domain.neighborhoodId,
      active: domain.active,
    });

    return plainToInstance(
      UserResponseDto,
      {
        id: domain.id,
        dni: domain.dni,
        firstName: domain.firstName,
        lastName: domain.lastName,
        email: domain.email,
        phone: domain.phone,
        roleId: domain.roleId,
        address: domain.address,
        neighborhoodId: domain.neighborhoodId,
        active: domain.active,
      },
      { excludeExtraneousValues: true },
    );
  }

  static toDtoWithRelations(domain: UserDomainEntity): UserWithRelationsDto {
    // Get the full relation objects from the domain
    const role = (domain as any).role;
    const neighborhood = (domain as any).neighborhood;
    const commune = (domain as any).commune;
    const city = (domain as any).city;

    // Create DTO with all relations properly mapped
    return plainToInstance(
      UserWithRelationsDto,
      {
        id: domain.id,
        dni: domain.dni,
        firstName: domain.firstName,
        lastName: domain.lastName,
        email: domain.email,
        phone: domain.phone,
        address: domain.address,
        active: domain.active,
        role: role,
        neighborhood: neighborhood,
        commune: commune,
        city: city,
      },
      { excludeExtraneousValues: true },
    );
  }
}
