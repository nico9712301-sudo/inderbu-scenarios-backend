import { Expose } from 'class-transformer';

export class ReservationInstanceDomainEntity {
  @Expose() readonly id: number | null;
  @Expose() readonly reservationId: number;
  @Expose() readonly timeslotId: number;
  @Expose() readonly reservationDate: Date;
  @Expose() readonly subScenarioId: number; // Denormalizado para consultas rápidas
  @Expose() readonly userId: number; // Denormalizado para consultas rápidas
  @Expose() readonly reservationStateId: number; // Denormalizado para consultas rápidas
  @Expose() readonly createdAt?: Date;

  constructor(builder: ReservationInstanceDomainBuilder) {
    this.id = builder.id;
    this.reservationId = builder.reservationId;
    this.timeslotId = builder.timeslotId;
    this.reservationDate = builder.reservationDate;
    this.subScenarioId = builder.subScenarioId;
    this.userId = builder.userId;
    this.reservationStateId = builder.reservationStateId;
    this.createdAt = builder.createdAt;
  }

  static builder(): ReservationInstanceDomainBuilder {
    return new ReservationInstanceDomainBuilder();
  }

  /**
   * Valida que la instancia sea válida
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.reservationId || this.reservationId <= 0) {
      errors.push('reservationId must be a positive number');
    }

    if (!this.timeslotId || this.timeslotId <= 0) {
      errors.push('timeslotId must be a positive number');
    }

    if (!this.reservationDate) {
      errors.push('reservationDate is required');
    }

    if (!this.subScenarioId || this.subScenarioId <= 0) {
      errors.push('subScenarioId must be a positive number');
    }

    if (!this.userId || this.userId <= 0) {
      errors.push('userId must be a positive number');
    }

    if (!this.reservationStateId || this.reservationStateId <= 0) {
      errors.push('reservationStateId must be a positive number');
    }

    return errors;
  }

  /**
   * Verifica si la instancia está activa (PENDIENTE o CONFIRMADA)
   */
  active(): boolean {
    return this.reservationStateId === 1 || this.reservationStateId === 2;
  }

  /**
   * Verifica si la instancia puede ser modificada
   */
  canBeModified(): boolean {
    return this.reservationStateId === 1; // Solo PENDIENTE
  }

  /**
   * Obtiene la fecha en formato YYYY-MM-DD
   */
  getDateString(): string {
    return this.reservationDate.toISOString().split('T')[0];
  }

  /**
   * Obtiene el día de la semana (0=Domingo, 1=Lunes, etc.)
   */
  getDayOfWeek(): number {
    return this.reservationDate.getDay();
  }

  /**
   * Verifica si esta instancia es igual a otra (mismo slot, fecha y escenario)
   */
  isEqualTo(other: ReservationInstanceDomainEntity): boolean {
    return (
      this.subScenarioId === other.subScenarioId &&
      this.timeslotId === other.timeslotId &&
      this.getDateString() === other.getDateString()
    );
  }

  /**
   * Verifica si hay conflicto con otra instancia
   */
  hasConflictWith(other: ReservationInstanceDomainEntity): boolean {
    // Hay conflicto si es el mismo slot, fecha y escenario, pero diferentes reservas
    return (
      this.isEqualTo(other) &&
      this.reservationId !== other.reservationId &&
      (this.active() || other.active())
    );
  }

  /**
   * Crea una copia con estado actualizado
   */
  withUpdatedState(newStateId: number): ReservationInstanceDomainEntity {
    const builder = ReservationInstanceDomainEntity.builder()
      .withReservationId(this.reservationId)
      .withTimeslotId(this.timeslotId)
      .withReservationDate(this.reservationDate)
      .withSubScenarioId(this.subScenarioId)
      .withUserId(this.userId)
      .withReservationStateId(newStateId)
      .withCreatedAt(this.createdAt);

    if (this.id !== null) {
      builder.withId(this.id);
    }

    return builder.build();
  }
}

export class ReservationInstanceDomainBuilder {
  id: number | null = null;
  reservationId: number;
  timeslotId: number;
  reservationDate: Date;
  subScenarioId: number;
  userId: number;
  reservationStateId: number;
  createdAt?: Date;

  withId(id: number): this {
    this.id = id;
    return this;
  }

  withReservationId(id: number): this {
    this.reservationId = id;
    return this;
  }

  withTimeslotId(id: number): this {
    this.timeslotId = id;
    return this;
  }

  withReservationDate(date: Date): this {
    this.reservationDate = new Date(date);
    return this;
  }

  withSubScenarioId(id: number): this {
    this.subScenarioId = id;
    return this;
  }

  withUserId(id: number): this {
    this.userId = id;
    return this;
  }

  withReservationStateId(id: number): this {
    this.reservationStateId = id;
    return this;
  }

  withCreatedAt(date?: Date): this {
    this.createdAt = date;
    return this;
  }

  build(): ReservationInstanceDomainEntity {
    const entity = new ReservationInstanceDomainEntity(this);
    const errors = entity.validate();

    if (errors.length > 0) {
      throw new Error(
        `ReservationInstance validation failed: ${errors.join(', ')}`,
      );
    }

    return entity;
  }
}
