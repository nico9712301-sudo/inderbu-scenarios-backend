export class SubScenarioImageDomainEntity {
  public readonly id: number | null;
  public readonly path: string;
  public readonly isFeature: boolean;
  public readonly displayOrder: number;
  public readonly subScenarioId: number;
  public readonly current: boolean;
  public readonly createdAt?: Date;

  constructor(builder: SubScenarioImageDomainBuilder) {
    this.id = builder.id;
    this.path = builder.path;
    this.isFeature = builder.isFeature;
    this.displayOrder = builder.displayOrder;
    this.subScenarioId = builder.subScenarioId;
    this.current = builder.current;
    this.createdAt = builder.createdAt;
  }

  static builder(): SubScenarioImageDomainBuilder {
    return new SubScenarioImageDomainBuilder();
  }
}

export class SubScenarioImageDomainBuilder {
  id: number | null = null;
  path: string = '';
  isFeature: boolean = false;
  displayOrder: number = 0;
  subScenarioId: number = 0;
  current: boolean = true;
  createdAt?: Date;

  withId(id: number): SubScenarioImageDomainBuilder {
    this.id = id;
    return this;
  }

  withPath(path: string): SubScenarioImageDomainBuilder {
    this.path = path;
    return this;
  }

  withIsFeature(isFeature: boolean): SubScenarioImageDomainBuilder {
    this.isFeature = isFeature;
    return this;
  }

  withDisplayOrder(displayOrder: number): SubScenarioImageDomainBuilder {
    this.displayOrder = displayOrder;
    return this;
  }

  withSubScenarioId(subScenarioId: number): SubScenarioImageDomainBuilder {
    this.subScenarioId = subScenarioId;
    return this;
  }

  withCurrent(current: boolean): SubScenarioImageDomainBuilder {
    this.current = current;
    return this;
  }

  withCreatedAt(createdAt: Date): SubScenarioImageDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  build(): SubScenarioImageDomainEntity {
    return new SubScenarioImageDomainEntity(this);
  }
}
