import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { CommuneResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/commune/commune-response.dto';
import { CreateCommuneDto } from '../../../../infrastructure/adapters/inbound/http/dtos/commune/create-commune.dto';
import { UpdateCommuneDto } from '../../../../infrastructure/adapters/inbound/http/dtos/commune/update-commune.dto';

export interface ICommuneApplicationPort {
  listAll(): Promise<CommuneResponseDto[]>;
  listPaged(opts: PageOptionsDto): Promise<PageDto<CommuneResponseDto>>;
  findById(id: number): Promise<CommuneResponseDto>;
  create(dto: CreateCommuneDto): Promise<CommuneResponseDto>;
  update(id: number, dto: UpdateCommuneDto): Promise<CommuneResponseDto>;
  delete(id: number): Promise<void>;
}
