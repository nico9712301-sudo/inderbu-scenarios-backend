import { RoleDomainEntity } from '../../../domain/entities/role.domain-entity';

export interface IRoleApplicationPort {
  getRoles(): Promise<RoleDomainEntity[]>;
}
