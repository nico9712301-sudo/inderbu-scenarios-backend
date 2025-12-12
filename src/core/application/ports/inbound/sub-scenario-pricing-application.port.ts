import { SubScenarioPriceDomainEntity } from '../../../domain/entities/sub-scenario-price.domain-entity';

export interface CreateSubScenarioPriceCommand {
  subScenarioId: number;
  hourlyPrice: number;
}

export interface UpdateSubScenarioPriceCommand {
  hourlyPrice: number;
}

export interface SubScenarioPricingApplicationPort {
  /**
   * Creates price configuration for a sub-scenario
   */
  createSubScenarioPrice(command: CreateSubScenarioPriceCommand): Promise<SubScenarioPriceDomainEntity>;

  /**
   * Updates hourly price for a sub-scenario
   */
  updateSubScenarioPrice(subScenarioId: number, command: UpdateSubScenarioPriceCommand): Promise<SubScenarioPriceDomainEntity>;

  /**
   * Removes price configuration for a sub-scenario
   */
  removeSubScenarioPrice(subScenarioId: number): Promise<boolean>;

  /**
   * Gets price configuration for a sub-scenario
   */
  getSubScenarioPrice(subScenarioId: number): Promise<SubScenarioPriceDomainEntity | null>;

  /**
   * Gets all sub-scenarios with price configurations
   */
  getAllSubScenarioPrices(page?: number, limit?: number): Promise<{ data: SubScenarioPriceDomainEntity[]; total: number }>;

  /**
   * Validates if a sub-scenario can have pricing configured
   */
  validateSubScenarioPricing(subScenarioId: number, hourlyPrice: number): Promise<{ isValid: boolean; reason?: string }>;

  /**
   * Calculates total cost for a reservation
   */
  calculateReservationCost(
    subScenarioId: number,
    startDateTime: Date,
    endDateTime: Date
  ): Promise<{ totalCost: number; totalHours: number; hourlyPrice: number }>;
}