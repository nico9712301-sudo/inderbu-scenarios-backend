import { SubScenarioImageDomainEntity } from '../../entities/sub-scenario-image.domain-entity';

export interface ISubScenarioImageRepositoryPort {
  save(
    image: SubScenarioImageDomainEntity,
  ): Promise<SubScenarioImageDomainEntity>;
  findBySubScenarioId(
    subScenarioId: number,
    includeHistorical?: boolean,
  ): Promise<SubScenarioImageDomainEntity[]>;
  findBySubScenarioIds(
    subScenarioIds: number[],
    includeHistorical?: boolean,
  ): Promise<SubScenarioImageDomainEntity[]>;
  findById(id: number): Promise<SubScenarioImageDomainEntity | null>;
  delete(id: number): Promise<boolean>;
  updateOrderAndFeature(
    images: SubScenarioImageDomainEntity[],
  ): Promise<SubScenarioImageDomainEntity[]>;
  markAsHistorical(subScenarioId: number, exceptIds?: number[]): Promise<void>;
  markAsHistoricalByPosition(
    subScenarioId: number,
    isFeature: boolean,
    displayOrder: number,
  ): Promise<void>;
}
