export class ScenarioDomainEntity {
  public readonly id: number | null;
  public readonly name: string;
  public readonly address: string;
  public readonly neighborhoodId?: number;
  public readonly active: boolean;

  constructor(builder: ScenarioDomainBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.address = builder.address;
    this.neighborhoodId = builder.neighborhoodId; // <–– y aquí
    this.active = builder.active; // <–– y aquí
  }

  static builder(): ScenarioDomainBuilder {
    return new ScenarioDomainBuilder();
  }
}

export class ScenarioDomainBuilder {
  id: number | null = null;
  active = true; // Por defecto, los escenarios son activos
  name = '';
  address = '';
  neighborhoodId?: number; // <–– y aquí

  withId(id: number) {
    this.id = id;
    return this;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withAddress(address: string) {
    this.address = address;
    return this;
  }

  withActive(active: boolean) {
    this.active = active;
    return this;
  }

  withNeighborhoodId(neighborhoodId?: number) {
    this.neighborhoodId = neighborhoodId;
    return this;
  }

  build(): ScenarioDomainEntity {
    return new ScenarioDomainEntity(this);
  }
}
