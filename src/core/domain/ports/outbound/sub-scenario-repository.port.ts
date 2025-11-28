import { SubScenarioDomainEntity } from '../../entities/sub-scenario.domain-entity';
import { SubScenarioPageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/sub-scenarios/sub-scenario-page-options.dto';

export interface ISubScenarioRepositoryPort {
  findPaged(
    opts: SubScenarioPageOptionsDto,
  ): Promise<{ data: SubScenarioDomainEntity[]; total: number }>;
  findByIdWithRelations(id: number): Promise<SubScenarioDomainEntity | null>;
  findById(id: number): Promise<SubScenarioDomainEntity | null>;
  save(subScenario: SubScenarioDomainEntity): Promise<SubScenarioDomainEntity>;
  delete(id: number): Promise<boolean>;
}
