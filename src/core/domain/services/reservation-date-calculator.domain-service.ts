import { Injectable } from '@nestjs/common';

/**
 * Domain Service para calcular fechas de reservas
 * Maneja la lógica compleja de rangos de fechas y días de semana
 */
@Injectable()
export class ReservationDateCalculatorDomainService {
  /**
   * Método principal para calcular fechas de una reserva
   * Alias para mantener compatibilidad
   */
  calculateDatesForReservation(
    type: 'SINGLE' | 'RANGE',
    initialDate: Date,
    finalDate?: Date | null,
    weekdays?: number[] | null,
  ): Date[] {
    return this.calculateDates(
      type,
      initialDate,
      finalDate || undefined,
      weekdays || undefined,
    );
  }

  /**
   * Calcula todas las fechas individuales para una reserva de tipo RANGE
   */
  calculateDatesForRange(
    initialDate: Date,
    finalDate: Date,
    weekdays?: number[],
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(initialDate);
    const end = new Date(finalDate);

    while (current <= end) {
      // Si no hay días de semana especificados, incluir todas las fechas del rango
      if (!weekdays || weekdays.length === 0) {
        dates.push(new Date(current));
      } else {
        // Solo incluir fechas que coincidan con los días de semana especificados
        const dayOfWeek = current.getDay(); // 0=Domingo, 1=Lunes, etc.
        if (weekdays.includes(dayOfWeek)) {
          dates.push(new Date(current));
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Calcula fechas para una reserva de tipo SINGLE
   */
  calculateDatesForSingle(date: Date): Date[] {
    return [new Date(date)];
  }

  /**
   * Calcula fechas basado en el tipo de reserva
   */
  calculateDates(
    type: 'SINGLE' | 'RANGE',
    initialDate: Date,
    finalDate?: Date,
    weekdays?: number[],
  ): Date[] {
    if (type === 'SINGLE') {
      return this.calculateDatesForSingle(initialDate);
    }

    if (type === 'RANGE' && finalDate) {
      return this.calculateDatesForRange(initialDate, finalDate, weekdays);
    }

    throw new Error(
      'Invalid reservation type or missing finalDate for RANGE type',
    );
  }

  /**
   * Valida que las fechas sean consistentes con el tipo de reserva
   */
  validateDates(
    type: 'SINGLE' | 'RANGE',
    initialDate: Date,
    finalDate?: Date,
    weekdays?: number[],
  ): string[] {
    const errors: string[] = [];

    if (type === 'SINGLE') {
      if (finalDate) {
        errors.push('finalDate should not be provided for SINGLE reservations');
      }
      if (weekdays && weekdays.length > 0) {
        errors.push('weekdays should not be provided for SINGLE reservations');
      }
    }

    if (type === 'RANGE') {
      if (!finalDate) {
        errors.push('finalDate is required for RANGE reservations');
      } else if (finalDate <= initialDate) {
        errors.push('finalDate must be after initialDate');
      }

      if (weekdays && weekdays.some((w) => w < 0 || w > 6)) {
        errors.push(
          'weekdays must contain values between 0 (Sunday) and 6 (Saturday)',
        );
      }
    }

    return errors;
  }
}
