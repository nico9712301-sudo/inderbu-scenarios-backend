import { Expose } from 'class-transformer';

export enum ReservationType {
  SINGLE = 'SINGLE',
  RANGE = 'RANGE',
}

export class ReservationDomainEntity {
  @Expose() readonly id: number | null;
  @Expose() readonly subScenarioId: number;
  @Expose() readonly userId: number;
  @Expose() readonly type: ReservationType;
  @Expose() readonly initialDate: Date;
  @Expose() readonly finalDate?: Date;
  @Expose() readonly weekDays?: number[];
  @Expose() readonly comments?: string;
  @Expose() readonly reservationStateId: number;
  @Expose() readonly createdAt?: Date;
  @Expose() readonly updatedAt?: Date;

  constructor(builder: ReservationDomainBuilder) {
    this.id = builder.id;
    this.subScenarioId = builder.subScenarioId;
    this.userId = builder.userId;
    this.type = builder.type;
    this.initialDate = builder.initialDate;
    this.finalDate = builder.finalDate;
    this.weekDays = builder.weekDays;
    this.comments = builder.comments;
    this.reservationStateId = builder.reservationStateId;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): ReservationDomainBuilder {
    return new ReservationDomainBuilder();
  }

  /**
   * Valida que la reserva sea consistente según su tipo
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.type === ReservationType.SINGLE) {
      if (this.finalDate) {
        errors.push('finalDate should not be provided for SINGLE reservations');
      }
      if (this.weekDays && this.weekDays.length > 0) {
        errors.push('weekDays should not be provided for SINGLE reservations');
      }
    }

    if (this.type === ReservationType.RANGE) {
      if (!this.finalDate) {
        errors.push('finalDate is required for RANGE reservations');
      } else if (this.finalDate <= this.initialDate) {
        errors.push('finalDate must be after initialDate');
      }

      if (this.weekDays && this.weekDays.some((w) => w < 0 || w > 6)) {
        errors.push(
          'weekDays must contain values between 0 (Sunday) and 6 (Saturday)',
        );
      }
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
   * Verifica si la reserva está activa (PENDIENTE o CONFIRMADA)
   */
  active(): boolean {
    return this.reservationStateId === 1 || this.reservationStateId === 2;
  }

  /**
   * Verifica si la reserva puede ser modificada
   */
  canBeModified(): boolean {
    return this.reservationStateId === 1; // Solo PENDIENTE
  }

  /**
   * Verifica si la reserva puede ser cancelada
   */
  canBeCancelled(): boolean {
    return this.reservationStateId === 1 || this.reservationStateId === 2; // PENDIENTE o CONFIRMADA
  }

  /**
   * Obtiene la duración en días de la reserva
   */
  getDurationInDays(): number {
    if (this.type === ReservationType.SINGLE) {
      return 1;
    }

    if (this.type === ReservationType.RANGE && this.finalDate) {
      const timeDiff = this.finalDate.getTime() - this.initialDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 para incluir ambos días
    }

    return 0;
  }

  /**
   * Verifica si la reserva incluye un día específico de la semana
   */
  includesWeekday(weekday: number): boolean {
    if (this.type === ReservationType.SINGLE) {
      return this.initialDate.getDay() === weekday;
    }

    if (this.type === ReservationType.RANGE) {
      return (
        !this.weekDays ||
        this.weekDays.length === 0 ||
        this.weekDays.includes(weekday)
      );
    }

    return false;
  }

  /**
   * Obtiene una descripción legible de la reserva
   */
  getDescription(): string {
    if (this.type === ReservationType.SINGLE) {
      return `Reserva para el ${this.initialDate.toISOString().split('T')[0]}`;
    }

    if (this.type === ReservationType.RANGE) {
      const start = this.initialDate.toISOString().split('T')[0];
      const end = this.finalDate?.toISOString().split('T')[0];

      if (this.weekDays && this.weekDays.length > 0) {
        const weekdayNames = [
          'Domingo',
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
        ];
        const selectedDays = this.weekDays
          .map((w) => weekdayNames[w])
          .join(', ');
        return `Reserva desde ${start} hasta ${end}, ${selectedDays}`;
      }

      return `Reserva desde ${start} hasta ${end}`;
    }

    return 'Reserva';
  }
}

export class ReservationDomainBuilder {
  id: number | null = null;
  subScenarioId: number;
  userId: number;
  type: ReservationType = ReservationType.SINGLE;
  initialDate: Date;
  finalDate?: Date;
  weekDays?: number[];
  comments?: string;
  reservationStateId: number = 1; // PENDIENTE por defecto
  createdAt?: Date;
  updatedAt?: Date;

  withId(id: number): this {
    this.id = id;
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

  withType(type: ReservationType): this {
    this.type = type;
    return this;
  }

  withInitialDate(date: Date): this {
    this.initialDate = date;
    return this;
  }

  withFinalDate(date?: Date): this {
    this.finalDate = date;
    return this;
  }

  withWeekDays(weekDays?: number[]): this {
    this.weekDays = weekDays;
    return this;
  }

  withComments(comments?: string): this {
    this.comments = comments;
    return this;
  }

  withReservationStateId(id: number): this {
    this.reservationStateId = id;
    return this;
  }

  withCreatedAt(date: Date): this {
    this.createdAt = date;
    return this;
  }

  withUpdatedAt(date: Date): this {
    this.updatedAt = date;
    return this;
  }

  // Métodos de conveniencia para tipos específicos
  asSingleReservation(date: Date): this {
    this.type = ReservationType.SINGLE;
    this.initialDate = date;
    this.finalDate = undefined;
    this.weekDays = undefined;
    return this;
  }

  asRangeReservation(
    initialDate: Date,
    finalDate: Date,
    weekDays?: number[],
  ): this {
    this.type = ReservationType.RANGE;
    this.initialDate = initialDate;
    this.finalDate = finalDate;
    this.weekDays = weekDays;
    return this;
  }

  build(): ReservationDomainEntity {
    const entity = new ReservationDomainEntity(this);
    const errors = entity.validate();

    if (errors.length > 0) {
      throw new Error(`Reservation validation failed: ${errors.join(', ')}`);
    }

    return entity;
  }
}
