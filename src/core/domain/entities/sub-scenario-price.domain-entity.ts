import { Expose } from 'class-transformer';

export class SubScenarioPriceDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly fkSubScenarioId: number;

  @Expose()
  public readonly hourlyPrice: number;

  @Expose()
  public readonly createdAt: Date;

  @Expose()
  public readonly updatedAt: Date;

  private constructor(builder: SubScenarioPriceDomainBuilder) {
    this.id = builder.id;
    this.fkSubScenarioId = builder.fkSubScenarioId;
    this.hourlyPrice = builder.hourlyPrice;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static buildFromBuilder(builder: SubScenarioPriceDomainBuilder): SubScenarioPriceDomainEntity {
    return new SubScenarioPriceDomainEntity(builder);
  }

  static builder(): SubScenarioPriceDomainBuilder {
    return new SubScenarioPriceDomainBuilder();
  }

  /**
   * Validates that the hourly price is positive
   */
  validatePrice(): boolean {
    return this.hourlyPrice > 0;
  }

  /**
   * Calculates total cost for given hours
   */
  calculateTotalCost(hours: number): number {
    if (hours <= 0 || !this.validatePrice()) {
      return 0;
    }
    return this.hourlyPrice * hours;
  }

  /**
   * Formats the price for display
   */
  formatPrice(currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
    }).format(this.hourlyPrice);
  }

  /**
   * Checks if the price is valid for business rules
   */
  isValidForBusiness(): boolean {
    return this.validatePrice() && this.fkSubScenarioId > 0;
  }
}

export class SubScenarioPriceDomainBuilder {
  id: number | null = null;
  fkSubScenarioId: number = 0;
  hourlyPrice: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  withId(id: number | null): SubScenarioPriceDomainBuilder {
    this.id = id;
    return this;
  }

  withFkSubScenarioId(fkSubScenarioId: number): SubScenarioPriceDomainBuilder {
    this.fkSubScenarioId = fkSubScenarioId;
    return this;
  }

  withHourlyPrice(hourlyPrice: number): SubScenarioPriceDomainBuilder {
    this.hourlyPrice = hourlyPrice;
    return this;
  }

  withCreatedAt(createdAt: Date): SubScenarioPriceDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): SubScenarioPriceDomainBuilder {
    this.updatedAt = updatedAt;
    return this;
  }

  build(): SubScenarioPriceDomainEntity {
    return SubScenarioPriceDomainEntity.buildFromBuilder(this);
  }
}