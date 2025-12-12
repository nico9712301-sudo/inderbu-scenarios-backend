import { Injectable, Inject } from '@nestjs/common';
import {
  SubScenarioPricingApplicationPort,
  CreateSubScenarioPriceCommand,
  UpdateSubScenarioPriceCommand,
} from '../ports/inbound/sub-scenario-pricing-application.port';
import { ISubScenarioPriceRepositoryPort } from '../../domain/ports/outbound/sub-scenario-price-repository.port';
import { ISubScenarioRepositoryPort } from '../../domain/ports/outbound/sub-scenario-repository.port';
import { SubScenarioPriceDomainEntity } from '../../domain/entities/sub-scenario-price.domain-entity';
import { PricingDomainService } from '../../domain/services/pricing.domain-service';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class SubScenarioPricingApplicationService implements SubScenarioPricingApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO_PRICE)
    private readonly subScenarioPriceRepository: ISubScenarioPriceRepositoryPort,
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO)
    private readonly subScenarioRepository: ISubScenarioRepositoryPort,
    private readonly pricingDomainService: PricingDomainService,
  ) {}

  async createSubScenarioPrice(command: CreateSubScenarioPriceCommand): Promise<SubScenarioPriceDomainEntity> {
    // Validate sub-scenario exists
    const subScenario = await this.subScenarioRepository.findById(command.subScenarioId);
    if (!subScenario) {
      throw new Error('Sub-escenario no encontrado');
    }

    // Validate pricing doesn't already exist
    const existingPrice = await this.subScenarioPriceRepository.findBySubScenarioId(command.subScenarioId);
    if (existingPrice) {
      throw new Error('El sub-escenario ya tiene una configuración de precios');
    }

    // Validate hourly price
    const priceValidation = this.pricingDomainService.validateHourlyPrice(command.hourlyPrice);
    if (!priceValidation.isValid) {
      throw new Error(priceValidation.reason);
    }

    // Create new price configuration
    const newPrice = SubScenarioPriceDomainEntity.builder()
      .withFkSubScenarioId(command.subScenarioId)
      .withHourlyPrice(command.hourlyPrice)
      .build();

    return await this.subScenarioPriceRepository.save(newPrice);
  }

  async updateSubScenarioPrice(
    subScenarioId: number,
    command: UpdateSubScenarioPriceCommand,
  ): Promise<SubScenarioPriceDomainEntity> {
    // Validate existing price configuration
    const existingPrice = await this.subScenarioPriceRepository.findBySubScenarioId(subScenarioId);
    if (!existingPrice) {
      throw new Error('No existe configuración de precios para este sub-escenario');
    }

    // Validate new hourly price
    const priceValidation = this.pricingDomainService.validateHourlyPrice(command.hourlyPrice);
    if (!priceValidation.isValid) {
      throw new Error(priceValidation.reason);
    }

    // Use specialized repository method for simple price updates
    const result = await this.subScenarioPriceRepository.updateHourlyPrice(subScenarioId, command.hourlyPrice);
    if (!result) {
      throw new Error('No se pudo actualizar el precio');
    }
    return result;
  }

  async removeSubScenarioPrice(subScenarioId: number): Promise<boolean> {
    // Validate existing price configuration
    const existingPrice = await this.subScenarioPriceRepository.findBySubScenarioId(subScenarioId);
    if (!existingPrice) {
      throw new Error('No existe configuración de precios para este sub-escenario');
    }

    return await this.subScenarioPriceRepository.deleteBySubScenarioId(subScenarioId);
  }

  async getSubScenarioPrice(subScenarioId: number): Promise<SubScenarioPriceDomainEntity | null> {
    return await this.subScenarioPriceRepository.findBySubScenarioId(subScenarioId);
  }

  async getAllSubScenarioPrices(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: SubScenarioPriceDomainEntity[]; total: number }> {
    return await this.subScenarioPriceRepository.findPaged(page, limit);
  }

  async validateSubScenarioPricing(
    subScenarioId: number,
    hourlyPrice: number,
  ): Promise<{ isValid: boolean; reason?: string }> {
    // Check if sub-scenario exists
    const subScenario = await this.subScenarioRepository.findById(subScenarioId);
    if (!subScenario) {
      return { isValid: false, reason: 'Sub-escenario no encontrado' };
    }

    // Check if sub-scenario is active
    if (!subScenario.active) {
      return { isValid: false, reason: 'No se puede configurar precios para sub-escenarios inactivos' };
    }

    // Validate hourly price using domain service
    const priceValidation = this.pricingDomainService.validateHourlyPrice(hourlyPrice);
    if (!priceValidation.isValid) {
      return { isValid: false, reason: priceValidation.reason };
    }

    return { isValid: true };
  }

  async calculateReservationCost(
    subScenarioId: number,
    startDateTime: Date,
    endDateTime: Date,
  ): Promise<{ totalCost: number; totalHours: number; hourlyPrice: number }> {
    // Get sub-scenario and pricing
    const [subScenario, pricing] = await Promise.all([
      this.subScenarioRepository.findById(subScenarioId),
      this.subScenarioPriceRepository.findBySubScenarioId(subScenarioId),
    ]);

    if (!subScenario) {
      throw new Error('Sub-escenario no encontrado');
    }

    if (!pricing) {
      return { totalCost: 0, totalHours: 0, hourlyPrice: 0 };
    }

    // Use domain service to calculate cost
    const pricingSummary = this.pricingDomainService.generatePricingSummary(
      pricing,
      startDateTime,
      endDateTime,
    );

    return {
      totalCost: pricingSummary.totalCost,
      totalHours: pricingSummary.totalHours,
      hourlyPrice: pricingSummary.hourlyPrice,
    };
  }
}