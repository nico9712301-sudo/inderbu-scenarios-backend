import { RoleDomainEntity } from 'src/core/domain/entities/role.domain-entity';

export interface IRoleApplicationPort {
  getRoles(): Promise<RoleDomainEntity[]>;
}
