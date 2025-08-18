import { ActivityAreaDomainEntity } from '../../entities/activity-area.domain-entity';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';

export interface IActivityAreaRepositoryPort {
  findById(id: number): Promise<ActivityAreaDomainEntity | null>;
  findByIds(ids: number[]): Promise<ActivityAreaDomainEntity[]>;
  findAll(): Promise<ActivityAreaDomainEntity[]>;
  save(entity: ActivityAreaDomainEntity): Promise<ActivityAreaDomainEntity>;
  findPaged(
    opts: PageOptionsDto,
  ): Promise<{ data: ActivityAreaDomainEntity[]; total: number }>;

  // NUEVO MÉTODO DELETE
  delete(id: number): Promise<boolean>;
}
