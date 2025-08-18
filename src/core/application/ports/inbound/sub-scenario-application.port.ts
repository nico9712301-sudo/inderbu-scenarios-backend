import { SubScenarioPageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/sub-scenarios/sub-scenario-page-options.dto';
import { PageDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { SubScenarioWithRelationsDto } from 'src/infrastructure/adapters/inbound/http/dtos/sub-scenarios/sub-scenario-response-with-relations.dto';
import { CreateSubScenarioDto } from 'src/infrastructure/adapters/inbound/http/dtos/sub-scenarios/create-sub-scenario.dto';
import { UpdateSubScenarioDto } from 'src/infrastructure/adapters/inbound/http/dtos/sub-scenarios/update-sub-scenario.dto';

export interface ISubScenarioApplicationPort {
  listWithRelations(
    opts: SubScenarioPageOptionsDto,
  ): Promise<PageDto<SubScenarioWithRelationsDto>>;

  getByIdWithRelations(id: number): Promise<SubScenarioWithRelationsDto>;

  create(
    createDto: CreateSubScenarioDto,
    images?: Express.Multer.File[],
  ): Promise<SubScenarioWithRelationsDto>;

  update(
    id: number,
    updateDto: UpdateSubScenarioDto,
  ): Promise<SubScenarioWithRelationsDto>;

  delete(id: number): Promise<boolean>;
}
