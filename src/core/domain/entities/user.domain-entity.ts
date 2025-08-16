// Este modelo representa la "esencia" del usuario, sin detalles de infraestructura.
// Se usa en la lógica de negocio (dominio) y es independiente de la persistencia.
import { Expose } from 'class-transformer';

export class UserDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly dni: number;

  @Expose()
  public readonly firstName: string;

  @Expose()
  public readonly lastName: string;

  @Expose()
  public readonly email: string;

  @Expose()
  public readonly phone: string;

  // La contraseña se almacena internamente como hash, pero no se expone.
  private readonly passwordHash: string;

  @Expose()
  public readonly roleId: number;

  @Expose()
  public readonly address: string;

  @Expose()
  public readonly neighborhoodId: number;

  @Expose() public readonly active: boolean;
  private readonly confirmationToken: string;
  private readonly confirmationTokenExpiresAt: Date | null;

  // Constructor privado: solo se puede llamar desde dentro de la clase.
  private constructor(builder: UserDomainBuilder) {
    this.id = builder.id;
    this.dni = builder.dni;
    this.firstName = builder.firstName;
    this.lastName = builder.lastName;
    this.email = builder.email;
    this.phone = builder.phone;
    this.passwordHash = builder.passwordHash;
    this.roleId = builder.roleId;
    this.address = builder.address;
    this.neighborhoodId = builder.neighborhoodId;
    this.active = builder.active;
    this.confirmationToken = builder.confirmationToken;
    this.confirmationTokenExpiresAt = builder.confirmationTokenExpiresAt;
  }

  // Método estático que permite construir la entidad a partir de un builder.
  static buildFromBuilder(builder: UserDomainBuilder): UserDomainEntity {
    // Aquí se pueden agregar validaciones o lógica adicional si se requiere.
    return new UserDomainEntity(builder);
  }

  // Método estático para iniciar la construcción.
  static builder(): UserDomainBuilder {
    return new UserDomainBuilder();
  }

  async validatePassword(
    plainPassword: string,
    encrypter: { compare: (plain: string, hash: string) => Promise<boolean> },
  ): Promise<boolean> {
    return await encrypter.compare(plainPassword, this.passwordHash);
  }
}

export class UserDomainBuilder {
  id: number | null = null;
  dni: number = 0;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  passwordHash: string = '';
  roleId: number = 0;
  address: string = '';
  neighborhoodId: number = 0;
  active = false;
  confirmationToken = '';
  confirmationTokenExpiresAt: Date | null = null;

  withId(id: number | null): UserDomainBuilder {
    this.id = id;
    return this;
  }

  withDni(dni: number): UserDomainBuilder {
    this.dni = dni;
    return this;
  }

  withFirstName(firstName: string): UserDomainBuilder {
    this.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): UserDomainBuilder {
    this.lastName = lastName;
    return this;
  }

  withEmail(email: string): UserDomainBuilder {
    this.email = email;
    return this;
  }

  withPhone(phone: string): UserDomainBuilder {
    this.phone = phone;
    return this;
  }

  withPasswordHash(passwordHash: string): UserDomainBuilder {
    this.passwordHash = passwordHash;
    return this;
  }

  withRoleId(roleId: number): UserDomainBuilder {
    this.roleId = roleId;
    return this;
  }

  withAddress(address: string): UserDomainBuilder {
    this.address = address;
    return this;
  }

  withNeighborhoodId(neighborhoodId: number): UserDomainBuilder {
    this.neighborhoodId = neighborhoodId;
    return this;
  }

  withActive(active: boolean): this {
    this.active = active;
    return this;
  }
  withConfirmationToken(token: string): this {
    this.confirmationToken = token;
    return this;
  }
  withConfirmationTokenExpiresAt(date: Date): this {
    this.confirmationTokenExpiresAt = date;
    return this;
  }

  build(): UserDomainEntity {
    // En lugar de llamar directamente al constructor, se llama al método estático.
    return UserDomainEntity.buildFromBuilder(this);
  }
}
