import { ScenarioDomainEntity } from '../../entities/scenario.domain-entity';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';

export interface IScenarioRepositoryPort {
  findById(id: number): Promise<ScenarioDomainEntity | null>;
  findByIds(ids: number[]): Promise<ScenarioDomainEntity[]>;
  findPaged(
    opts: PageOptionsDto,
  ): Promise<{ data: ScenarioDomainEntity[]; total: number }>;
  findAll(): Promise<ScenarioDomainEntity[]>;

  // NUEVOS MÉTODOS CRUD
  save(scenario: ScenarioDomainEntity): Promise<ScenarioDomainEntity>;
  delete(id: number): Promise<boolean>;
}
