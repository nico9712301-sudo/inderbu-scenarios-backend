import { RoleDomainEntity } from '../../entities/role.domain-entity';

export interface IRoleRepositoryPort {
  findAll(): Promise<RoleDomainEntity[]>;
}
