import { Injectable } from '@nestjs/common';
import { SubScenarioDomainEntity } from '../entities/sub-scenario.domain-entity';
import { SubScenarioPriceDomainEntity } from '../entities/sub-scenario-price.domain-entity';
import { ReservationDomainEntity } from '../entities/reservation.domain-entity';

@Injectable()
export class PricingDomainService {
  /**
   * Calculates total cost for a reservation based on sub-scenario pricing
   */
  calculateReservationCost(
    subScenario: SubScenarioDomainEntity,
    pricing: SubScenarioPriceDomainEntity | null,
    startDateTime: Date,
    endDateTime: Date,
  ): number {
    if (!pricing) {
      return 0;
    }

    const hours = this.calculateHoursBetweenDates(startDateTime, endDateTime);
    return hours * pricing.hourlyPrice;
  }

  /**
   * Determines if a sub-scenario has any cost configured
   */
  hasConfiguredPricing(pricing: SubScenarioPriceDomainEntity | null): boolean {
    return pricing !== null && pricing.hourlyPrice > 0;
  }

  /**
   * Validates that a price is within business rules
   */
  validateHourlyPrice(price: number): { isValid: boolean; reason?: string } {
    if (price < 0) {
      return { isValid: false, reason: 'El precio no puede ser negativo' };
    }

    if (price > 10000) {
      return { isValid: false, reason: 'El precio no puede exceder $10,000 por hora' };
    }

    if (!this.isValidDecimalPlaces(price, 2)) {
      return { isValid: false, reason: 'El precio no puede tener más de 2 decimales' };
    }

    return { isValid: true };
  }

  /**
   * Determines if a reservation requires payment proof
   */
  requiresPaymentProof(
    subScenario: SubScenarioDomainEntity,
    pricing: SubScenarioPriceDomainEntity | null,
    totalCost: number,
  ): boolean {
    return this.hasConfiguredPricing(pricing) && totalCost > 0;
  }

  /**
   * Calculates hours between two dates with proper rounding
   */
  private calculateHoursBetweenDates(startDate: Date, endDate: Date): number {
    const millisecondsDiff = endDate.getTime() - startDate.getTime();
    const hours = millisecondsDiff / (1000 * 60 * 60);

    // Round up to the nearest hour (minimum billing unit)
    return Math.ceil(hours);
  }

  /**
   * Validates decimal places for monetary values
   */
  private isValidDecimalPlaces(value: number, maxDecimalPlaces: number): boolean {
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    return decimalPlaces <= maxDecimalPlaces;
  }

  /**
   * Formats price for display
   */
  formatPrice(price: number, currency: string = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Generates pricing summary for a reservation
   */
  generatePricingSummary(
    pricing: SubScenarioPriceDomainEntity | null,
    startDateTime: Date,
    endDateTime: Date,
  ): {
    hasPrice: boolean;
    hourlyPrice: number;
    totalHours: number;
    totalCost: number;
    formattedCost: string;
  } {
    if (!pricing) {
      return {
        hasPrice: false,
        hourlyPrice: 0,
        totalHours: 0,
        totalCost: 0,
        formattedCost: '$0.00',
      };
    }

    const totalHours = this.calculateHoursBetweenDates(startDateTime, endDateTime);
    const totalCost = totalHours * pricing.hourlyPrice;

    return {
      hasPrice: true,
      hourlyPrice: pricing.hourlyPrice,
      totalHours,
      totalCost,
      formattedCost: this.formatPrice(totalCost),
    };
  }
}