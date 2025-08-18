import { NeighborhoodDomainEntity } from '../../../domain/entities/neighborhood.domain-entity';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { NeighborhoodResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/neighborhood/neighborhood-response.dto';
import { CreateNeighborhoodDto } from '../../../../infrastructure/adapters/inbound/http/dtos/neighborhood/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from '../../../../infrastructure/adapters/inbound/http/dtos/neighborhood/update-neighborhood.dto';

export interface INeighborhoodApplicationPort {
  listAll(): Promise<NeighborhoodDomainEntity[]>;
  listPaged(opts: PageOptionsDto): Promise<PageDto<NeighborhoodResponseDto>>;
  findById(id: number): Promise<NeighborhoodResponseDto>;
  create(dto: CreateNeighborhoodDto): Promise<NeighborhoodResponseDto>;
  update(
    id: number,
    dto: UpdateNeighborhoodDto,
  ): Promise<NeighborhoodResponseDto>;
  delete(id: number): Promise<void>;
}
