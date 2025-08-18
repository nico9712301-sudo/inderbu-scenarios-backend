export class FieldSurfaceTypeDomainEntity {
  constructor(
    readonly id: number | null,
    readonly name: string,
    readonly createdAt?: Date | null,
  ) {}

  // Builder pattern para crear instancias
  static builder(): FieldSurfaceTypeBuilder {
    return new FieldSurfaceTypeBuilder();
  }

  // Factory method desde un DTO plano
  static from(data: {
    id?: number | null;
    name: string;
  }): FieldSurfaceTypeDomainEntity {
    return new FieldSurfaceTypeDomainEntity(data.id || null, data.name);
  }
}

// Builder para construcción fluida
export class FieldSurfaceTypeBuilder {
  private id: number | null = null;
  private name: string = '';
  private createdAt: Date | null = null;

  withId(id: number | null): FieldSurfaceTypeBuilder {
    this.id = id;
    return this;
  }

  withName(name: string): FieldSurfaceTypeBuilder {
    this.name = name;
    return this;
  }

  withCreatedAt(date: Date | null): FieldSurfaceTypeBuilder {
    this.createdAt = date;
    return this;
  }

  build(): FieldSurfaceTypeDomainEntity {
    // Validaciones de dominio
    if (this.name.trim().length === 0) {
      throw new Error('FieldSurfaceType name cannot be empty');
    }

    return new FieldSurfaceTypeDomainEntity(this.id, this.name, this.createdAt);
  }
}
