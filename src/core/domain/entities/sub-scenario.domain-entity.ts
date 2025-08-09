export class SubScenarioDomainEntity {
  public readonly id: number | null;
  public readonly name: string;
  public readonly active: boolean;
  public readonly hasCost: boolean;
  public readonly numberOfSpectators?: number;
  public readonly numberOfPlayers?: number;
  public readonly recommendations?: string;
  public readonly scenarioId: number;
  public readonly activityAreaId?: number;
  public readonly fieldSurfaceTypeId?: number;
  public readonly createdAt?: Date;

  constructor(builder: SubScenarioDomainBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.active = builder.active;
    this.hasCost = builder.hasCost;
    this.numberOfSpectators = builder.numberOfSpectators;
    this.numberOfPlayers = builder.numberOfPlayers;
    this.recommendations = builder.recommendations;
    this.scenarioId = builder.scenarioId;
    this.activityAreaId = builder.activityAreaId;
    this.fieldSurfaceTypeId = builder.fieldSurfaceTypeId;
    this.createdAt = builder.createdAt;
  }

  static builder(): SubScenarioDomainBuilder {
    return new SubScenarioDomainBuilder();
  }
}

export class SubScenarioDomainBuilder {
  id: number | null = null;
  name: string = '';
  active: boolean = false;
  hasCost: boolean = false;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  scenarioId: number = 0;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
  createdAt?: Date;

  withId(id: number): SubScenarioDomainBuilder {
    this.id = id;
    return this;
  }

  withName(name: string): SubScenarioDomainBuilder {
    this.name = name;
    return this;
  }
  
  withActive(active: boolean): SubScenarioDomainBuilder {
    this.active = active;
    return this;
  }

  withHasCost(hasCost: boolean): SubScenarioDomainBuilder {
    this.hasCost = hasCost;
    return this;
  }

  withnumberOfSpectators(layers: number): SubScenarioDomainBuilder {
    this.numberOfSpectators = layers;
    return this;
  }

  withNumberOfPlayers(players: number): SubScenarioDomainBuilder {
    this.numberOfPlayers = players;
    return this;
  }

  withRecommendations(recommendations: string): SubScenarioDomainBuilder {
    this.recommendations = recommendations;
    return this;
  }

  withScenarioId(scenarioId: number): SubScenarioDomainBuilder {
    this.scenarioId = scenarioId;
    return this;
  }

  withActivityAreaId(activityAreaId: number): SubScenarioDomainBuilder {
    this.activityAreaId = activityAreaId;
    return this;
  }

  withFieldSurfaceTypeId(fieldSurfaceTypeId: number): SubScenarioDomainBuilder {
    this.fieldSurfaceTypeId = fieldSurfaceTypeId;
    return this;
  }
  
  withCreatedAt(createdAt: Date): SubScenarioDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  build(): SubScenarioDomainEntity {
    return new SubScenarioDomainEntity(this);
  }
}
