import { Injectable, Inject } from '@nestjs/common';

import { IRoleRepositoryPort } from 'src/core/domain/ports/outbound/role.domain-entity';
import { RoleDomainEntity } from 'src/core/domain/entities/role.domain-entity';
import { IRoleApplicationPort } from '../ports/inbound/role-application.port';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

@Injectable()
export class RoleApplicationService implements IRoleApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.ROLE)
    private readonly roleRepository: IRoleRepositoryPort,
  ) {}

  async getRoles(): Promise<RoleDomainEntity[]> {
    const all = await this.roleRepository.findAll();
    // Filtramos los dos roles
    return all.filter((r) => r.name !== 'super-admin' && r.name !== 'admin');
  }
}
