import { CommuneDomainEntity } from '../../entities/commune.domain-entity';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';

export interface ICommuneRepositoryPort {
  findAll(): Promise<CommuneDomainEntity[]>;
  findById(id: number): Promise<CommuneDomainEntity | null>;
  findByIds(ids: number[]): Promise<CommuneDomainEntity[]>;
  findPaged(
    opts: PageOptionsDto,
  ): Promise<{ data: CommuneDomainEntity[]; total: number }>;
  save(entity: CommuneDomainEntity): Promise<CommuneDomainEntity>;
  deleteById(id: number): Promise<void>;
}
