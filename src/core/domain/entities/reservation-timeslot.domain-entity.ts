import { Expose } from 'class-transformer';

export class ReservationTimeslotDomainEntity {
  @Expose() readonly id: number | null;
  @Expose() readonly reservationId: number;
  @Expose() readonly timeslotId: number;
  @Expose() readonly createdAt?: Date;

  constructor(builder: ReservationTimeslotDomainBuilder) {
    this.id = builder.id;
    this.reservationId = builder.reservationId;
    this.timeslotId = builder.timeslotId;
    this.createdAt = builder.createdAt;
  }

  static builder(): ReservationTimeslotDomainBuilder {
    return new ReservationTimeslotDomainBuilder();
  }

  /**
   * Valida que la relación sea válida
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.reservationId || this.reservationId <= 0) {
      errors.push('reservationId must be a positive number');
    }

    if (!this.timeslotId || this.timeslotId <= 0) {
      errors.push('timeslotId must be a positive number');
    }

    return errors;
  }

  /**
   * Verifica si esta relación es igual a otra
   */
  isEqualTo(other: ReservationTimeslotDomainEntity): boolean {
    return (
      this.reservationId === other.reservationId &&
      this.timeslotId === other.timeslotId
    );
  }
}

export class ReservationTimeslotDomainBuilder {
  id: number | null = null;
  reservationId: number;
  timeslotId: number;
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

  withCreatedAt(date: Date): this {
    this.createdAt = date;
    return this;
  }

  build(): ReservationTimeslotDomainEntity {
    const entity = new ReservationTimeslotDomainEntity(this);
    const errors = entity.validate();

    if (errors.length > 0) {
      throw new Error(
        `ReservationTimeslot validation failed: ${errors.join(', ')}`,
      );
    }

    return entity;
  }
}
