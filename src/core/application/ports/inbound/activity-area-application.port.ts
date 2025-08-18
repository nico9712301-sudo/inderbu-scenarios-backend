import { ActivityAreaDomainEntity } from '../../../domain/entities/activity-area.domain-entity';
import { CreateActivityAreaDto } from '../../../../infrastructure/adapters/inbound/http/dtos/activity-area/create-activity-area.dto';
import { UpdateActivityAreaDto } from '../../../../infrastructure/adapters/inbound/http/dtos/activity-area/update-activity-area.dto';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { ActivityAreaResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/activity-area/activity-area-response.dto';

export interface IActivityAreaApplicationPort {
  listAll(): Promise<ActivityAreaDomainEntity[]>;
  listPaged(opts: PageOptionsDto): Promise<PageDto<ActivityAreaResponseDto>>;

  // NUEVOS MÉTODOS CRUD
  getById(id: number): Promise<ActivityAreaDomainEntity | null>;
  create(dto: CreateActivityAreaDto): Promise<ActivityAreaResponseDto>;
  update(
    id: number,
    dto: UpdateActivityAreaDto,
  ): Promise<ActivityAreaResponseDto>;
  delete(id: number): Promise<boolean>;
}
