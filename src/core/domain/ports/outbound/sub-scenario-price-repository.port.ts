import { SubScenarioPriceDomainEntity } from '../../entities/sub-scenario-price.domain-entity';

export interface ISubScenarioPriceRepositoryPort {
  /**
   * Finds price configuration for a specific sub-scenario
   */
  findBySubScenarioId(subScenarioId: number): Promise<SubScenarioPriceDomainEntity | null>;

  /**
   * Finds all price configurations with pagination
   */
  findPaged(page: number, limit: number): Promise<{ data: SubScenarioPriceDomainEntity[]; total: number }>;

  /**
   * Finds a price configuration by ID
   */
  findById(id: number): Promise<SubScenarioPriceDomainEntity | null>;

  /**
   * Saves a price configuration (create or update)
   */
  save(price: SubScenarioPriceDomainEntity): Promise<SubScenarioPriceDomainEntity>;

  /**
   * Deletes a price configuration by sub-scenario ID
   */
  deleteBySubScenarioId(subScenarioId: number): Promise<boolean>;

  /**
   * Checks if a sub-scenario has a price configuration
   */
  hasPrice(subScenarioId: number): Promise<boolean>;

  /**
   * Gets all sub-scenarios with price configurations
   */
  findAllWithPrices(): Promise<SubScenarioPriceDomainEntity[]>;

  /**
   * Updates the hourly price for a specific sub-scenario
   */
  updateHourlyPrice(subScenarioId: number, newPrice: number): Promise<SubScenarioPriceDomainEntity | null>;
}