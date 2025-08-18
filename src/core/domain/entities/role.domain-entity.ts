import { Expose } from 'class-transformer';

export class RoleDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly name: string;

  @Expose()
  public readonly description: string;

  // Constructor privado, solo accesible desde el builder
  constructor(builder: RoleDomainBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.description = builder.description;
  }

  // Punto de entrada para comenzar la construcción
  static builder(): RoleDomainBuilder {
    return new RoleDomainBuilder();
  }
}

class RoleDomainBuilder {
  id: number | null = null;
  name: string = '';
  description: string = '';

  withId(id: number): RoleDomainBuilder {
    this.id = id;
    return this;
  }

  withName(name: string): RoleDomainBuilder {
    this.name = name;
    return this;
  }

  withDescription(description: string): RoleDomainBuilder {
    this.description = description;
    return this;
  }

  build(): RoleDomainEntity {
    return new RoleDomainEntity(this);
  }
}
