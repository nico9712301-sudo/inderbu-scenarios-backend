import { Injectable } from '@nestjs/common';

export interface ReservationInstanceData {
  reservationId: number;
  timeslotId: number;
  reservationDate: Date;
  subScenarioId: number;
  userId: number;
  reservationStateId: number;
}

/**
 * Domain Service para generar instancias de reserva
 * Convierte una reserva compleja en múltiples instancias atómicas
 */
@Injectable()
export class ReservationInstanceGeneratorDomainService {
  /**
   * Genera todas las instancias para una reserva
   */
  generateInstances(
    reservationId: number,
    subScenarioId: number,
    userId: number,
    reservationStateId: number,
    timeslotIds: number[],
    reservationDates: Date[],
  ): ReservationInstanceData[] {
    const instances: ReservationInstanceData[] = [];

    for (const date of reservationDates) {
      for (const timeslotId of timeslotIds) {
        instances.push({
          reservationId,
          timeslotId,
          reservationDate: new Date(date),
          subScenarioId,
          userId,
          reservationStateId,
        });
      }
    }

    return instances;
  }

  /**
   * Calcula el total de instancias que se generarán
   */
  calculateTotalInstances(
    timeslotIds: number[],
    reservationDates: Date[],
  ): number {
    return timeslotIds.length * reservationDates.length;
  }

  /**
   * Valida que los datos para generar instancias sean válidos
   */
  validateInstanceData(
    reservationId: number,
    timeslotIds: number[],
    reservationDates: Date[],
  ): string[] {
    const errors: string[] = [];

    if (!reservationId || reservationId <= 0) {
      errors.push('reservationId must be a positive number');
    }

    if (!timeslotIds || timeslotIds.length === 0) {
      errors.push('At least one timeslot must be provided');
    }

    if (!reservationDates || reservationDates.length === 0) {
      errors.push('At least one reservation date must be provided');
    }

    if (timeslotIds.some((id) => !id || id <= 0)) {
      errors.push('All timeslot IDs must be positive numbers');
    }

    return errors;
  }

  /**
   * Agrupa instancias por fecha para mejor organización
   */
  groupInstancesByDate(
    instances: ReservationInstanceData[],
  ): Map<string, ReservationInstanceData[]> {
    const grouped = new Map<string, ReservationInstanceData[]>();

    for (const instance of instances) {
      const dateKey = instance.reservationDate.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(instance);
    }

    return grouped;
  }

  /**
   * Agrupa instancias por timeslot
   */
  groupInstancesByTimeslot(
    instances: ReservationInstanceData[],
  ): Map<number, ReservationInstanceData[]> {
    const grouped = new Map<number, ReservationInstanceData[]>();

    for (const instance of instances) {
      if (!grouped.has(instance.timeslotId)) {
        grouped.set(instance.timeslotId, []);
      }
      grouped.get(instance.timeslotId)!.push(instance);
    }

    return grouped;
  }

  /**
   * Genera resumen de instancias para respuesta al usuario
   */
  generateInstanceSummary(instances: ReservationInstanceData[]): {
    totalInstances: number;
    totalDates: number;
    totalTimeslots: number;
    dateRange: { first: string; last: string };
    timeslotRange: { min: number; max: number };
  } {
    if (instances.length === 0) {
      return {
        totalInstances: 0,
        totalDates: 0,
        totalTimeslots: 0,
        dateRange: { first: '', last: '' },
        timeslotRange: { min: 0, max: 0 },
      };
    }

    const uniqueDates = new Set(
      instances.map((i) => i.reservationDate.toISOString().split('T')[0]),
    );
    const uniqueTimeslots = new Set(instances.map((i) => i.timeslotId));

    const sortedDates = Array.from(uniqueDates).sort();
    const sortedTimeslots = Array.from(uniqueTimeslots).sort((a, b) => a - b);

    return {
      totalInstances: instances.length,
      totalDates: uniqueDates.size,
      totalTimeslots: uniqueTimeslots.size,
      dateRange: {
        first: sortedDates[0],
        last: sortedDates[sortedDates.length - 1],
      },
      timeslotRange: {
        min: sortedTimeslots[0],
        max: sortedTimeslots[sortedTimeslots.length - 1],
      },
    };
  }
}
