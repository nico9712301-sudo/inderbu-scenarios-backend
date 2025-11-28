import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RoleDomainEntity } from '../../../../core/domain/entities/role.domain-entity';
import { RoleEntity } from '../../../persistence/role.entity';
import { RoleEntityMapper } from '../../../mappers/role/role-entity.mapper';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { IRoleRepositoryPort } from '../../../../core/domain/ports/outbound/role.domain-entity';

@Injectable()
export class RoleRepositoryAdapter
  extends BaseRepositoryAdapter<RoleEntity, RoleDomainEntity>
  implements IRoleRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.ROLE)
    repository: Repository<RoleEntity>,
  ) {
    super(repository, []);
  }

  /** Convierte la entidad de persistencia a dominio */
  protected toDomain(entity: RoleEntity): RoleDomainEntity {
    return RoleEntityMapper.toDomain(entity);
  }

  /** Convierte la entidad de dominio a persistencia */
  protected toEntity(domain: RoleDomainEntity): RoleEntity {
    const entity = new RoleEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.description = domain.description;
    return entity;
  }

  async findAll(): Promise<RoleDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }
}
