import { ScenarioDomainEntity } from '../../../domain/entities/scenario.domain-entity';
import { CreateScenarioDto } from '../../../../infrastructure/adapters/inbound/http/dtos/scenario/create-scenario.dto';
import { UpdateScenarioDto } from '../../../../infrastructure/adapters/inbound/http/dtos/scenario/update-scenario.dto';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { ScenarioResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/scenario/scenario-response.dto';

export interface IScenarioApplicationPort {
  listAll(): Promise<ScenarioDomainEntity[]>;
  getById(id: number): Promise<ScenarioDomainEntity | null>;
  listPaged(opts: PageOptionsDto): Promise<PageDto<ScenarioResponseDto>>;

  // NUEVOS MÉTODOS CRUD
  create(dto: CreateScenarioDto): Promise<ScenarioResponseDto>;
  update(id: number, dto: UpdateScenarioDto): Promise<ScenarioResponseDto>;
  delete(id: number): Promise<boolean>;
}
