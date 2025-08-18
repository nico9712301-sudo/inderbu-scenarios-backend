import { Injectable } from '@nestjs/common';
import {
  AggregatedAvailabilityResponseDto,
  TimeslotAvailabilityDetailDto,
} from 'src/infrastructure/adapters/inbound/http/dtos/reservation/aggregated-availability.dto';
import {
  SimplifiedAvailabilityResponseDto,
  TimeSlotBasicDto,
  RequestedConfigurationDto,
  AvailabilityStatsDto,
} from 'src/infrastructure/adapters/inbound/http/dtos/reservation/simplified-availability-response.dto';

export interface TimeslotAvailability {
  timeslotId: number;
  isAvailable: boolean;
  conflictingReservationId?: number;
  conflictingUserId?: number;
}

export interface DateAvailability {
  date: string;
  dayOfWeek: number;
  availableTimeslotIds: number[];
  occupiedTimeslotIds: number[];
  timeslotAvailability: TimeslotAvailability[];
}

/**
 * Domain Service para verificar disponibilidad de timeslots
 */
@Injectable()
export class ReservationAvailabilityCheckerDomainService {
  /**
   * Calcula disponibilidad simplificada con datos YA obtenidos por Application Service
   */
  calculateSimplifiedAvailability(
    subScenarioId: number,
    calculatedDates: Date[],
    occupiedInstancesByDate: Map<
      string,
      Array<{
        timeslotId: number;
        reservationStateId: number;
        reservationId: number;
        userId: number;
      }>
    >,
    initialDate: string,
    finalDate?: string,
    weekdays?: number[],
  ): SimplifiedAvailabilityResponseDto {
    if (calculatedDates.length === 0) {
      throw new Error('calculatedDates cannot be empty');
    }

    // 1. Generar disponibilidad para cada fecha
    const allTimeslotIds = Array.from({ length: 24 }, (_, i) => i + 1); // Cambiar de 0-23 a 1-24
    const dateAvailabilities = this.getAvailabilityForDateRange(
      calculatedDates,
      allTimeslotIds,
      occupiedInstancesByDate,
    );

    // 2. Calcular qué timeslots están disponibles en TODAS las fechas
    const availableInAllDates = this.calculateAvailableInAllDates(
      allTimeslotIds,
      dateAvailabilities,
    );

    // 3. Generar timeSlots con información básica
    const timeSlots: TimeSlotBasicDto[] = allTimeslotIds.map((id) => ({
      id,
      startTime: `${String(id - 1).padStart(2, '0')}:00:00`, // Usar id-1 para el tiempo
      endTime: `${String(id - 1).padStart(2, '0')}:59:59`, // Usar id-1 para el tiempo
      isAvailableInAllDates: availableInAllDates.includes(id),
    }));

    // 4. Generar estadísticas
    const stats = this.calculateAvailabilityStats(dateAvailabilities);

    // 5. Construir respuesta simplificada
    return {
      subScenarioId,
      requestedConfiguration: {
        initialDate,
        finalDate,
        weekdays,
      },
      calculatedDates: calculatedDates.map(
        (d) => d.toISOString().split('T')[0],
      ),
      timeSlots,
      stats: {
        totalDates: stats.totalDates,
        totalTimeslots: stats.totalTimeslots,
        totalSlots: stats.totalSlots,
        availableSlots: stats.availableSlots,
        occupiedSlots: stats.occupiedSlots,
        globalAvailabilityPercentage: stats.availabilityPercentage,
        datesWithFullAvailability: stats.datesWithFullAvailability,
        datesWithNoAvailability: stats.datesWithNoAvailability,
      },
      queriedAt: new Date().toISOString(),
    };
  }

  /**
   * Calcula qué timeslots están disponibles en TODAS las fechas
   */
  private calculateAvailableInAllDates(
    allTimeslotIds: number[],
    dateAvailabilities: DateAvailability[],
  ): number[] {
    return allTimeslotIds.filter((timeslotId) => {
      const availabilityCount = dateAvailabilities.filter((da) =>
        da.availableTimeslotIds.includes(timeslotId),
      ).length;
      return availabilityCount === dateAvailabilities.length;
    });
  }
  /**
   * Calcula disponibilidad agregada con datos YA obtenidos por Application Service
   */
  calculateAggregatedAvailability(
    subScenarioId: number,
    calculatedDates: Date[],
    occupiedInstancesByDate: Map<
      string,
      Array<{
        timeslotId: number;
        reservationStateId: number;
        reservationId: number;
        userId: number;
      }>
    >,
    initialDate: string,
    finalDate?: string,
    weekdays?: number[],
  ): AggregatedAvailabilityResponseDto {
    if (calculatedDates.length === 0) {
      throw new Error('calculatedDates cannot be empty');
    }

    // 1. Generar disponibilidad para cada fecha (método existente)
    const allTimeslotIds = Array.from({ length: 24 }, (_, i) => i + 1); // Cambiar de 0-23 a 1-24
    const dateAvailabilities = this.getAvailabilityForDateRange(
      calculatedDates,
      allTimeslotIds,
      occupiedInstancesByDate,
    );

    // 2. Calcular intersecciones y uniones
    const availability = this.calculateAggregatedTimeslotAvailability(
      allTimeslotIds,
      dateAvailabilities,
    );

    // 3. Generar estadísticas
    const stats = this.calculateAvailabilityStats(dateAvailabilities);

    // 4. Generar detalles por timeslot
    const timeslotDetails = this.generateTimeslotDetails(
      allTimeslotIds,
      dateAvailabilities,
    );

    // 5. Construir respuesta (lógica pura)
    return {
      subScenarioId,
      requestedConfiguration: {
        initialDate,
        finalDate,
        weekdays,
      },
      calculatedDates: calculatedDates.map(
        (d) => d.toISOString().split('T')[0],
      ),
      availableInAllDates: availability.availableInAllDates,
      availableInAnyDate: availability.availableInAnyDate,
      occupiedInAllDates: availability.occupiedInAllDates,
      timeslotDetails,
      dateAvailabilities: dateAvailabilities.map((da) => ({
        date: da.date,
        dayOfWeek: da.dayOfWeek,
        availableTimeslotIds: da.availableTimeslotIds,
        occupiedTimeslotIds: da.occupiedTimeslotIds,
        totalAvailable: da.availableTimeslotIds.length,
        totalOccupied: da.occupiedTimeslotIds.length,
        availabilityPercentage:
          Math.round(
            (da.availableTimeslotIds.length / allTimeslotIds.length) *
              100 *
              100,
          ) / 100,
      })),
      stats: {
        totalDates: stats.totalDates,
        totalTimeslots: stats.totalTimeslots,
        totalSlots: stats.totalSlots,
        availableSlots: stats.availableSlots,
        occupiedSlots: stats.occupiedSlots,
        globalAvailabilityPercentage: stats.availabilityPercentage,
        datesWithFullAvailability: stats.datesWithFullAvailability,
        datesWithNoAvailability: stats.datesWithNoAvailability,
      },
      queriedAt: new Date().toISOString(),
    };
  }

  /**
   * Calcula disponibilidad agregada para timeslots (LÓGICA PURA)
   */
  private calculateAggregatedTimeslotAvailability(
    allTimeslotIds: number[],
    dateAvailabilities: DateAvailability[],
  ): {
    availableInAllDates: number[];
    availableInAnyDate: number[];
    occupiedInAllDates: number[];
  } {
    const availableInAllDates: number[] = [];
    const availableInAnyDate: number[] = [];
    const occupiedInAllDates: number[] = [];

    allTimeslotIds.forEach((timeslotId) => {
      const availabilityCount = dateAvailabilities.filter((da) =>
        da.availableTimeslotIds.includes(timeslotId),
      ).length;

      if (availabilityCount === dateAvailabilities.length) {
        availableInAllDates.push(timeslotId);
      }

      if (availabilityCount > 0) {
        availableInAnyDate.push(timeslotId);
      }

      if (availabilityCount === 0) {
        occupiedInAllDates.push(timeslotId);
      }
    });

    return {
      availableInAllDates,
      availableInAnyDate,
      occupiedInAllDates,
    };
  }

  /**
   * Genera detalles por timeslot (LÓGICA PURA)
   */
  private generateTimeslotDetails(
    allTimeslotIds: number[],
    dateAvailabilities: DateAvailability[],
  ): TimeslotAvailabilityDetailDto[] {
    return allTimeslotIds.map((timeslotId) => {
      const availableCount = dateAvailabilities.filter((da) =>
        da.availableTimeslotIds.includes(timeslotId),
      ).length;

      const occupiedCount = dateAvailabilities.length - availableCount;
      const availabilityPercentage =
        Math.round((availableCount / dateAvailabilities.length) * 100 * 100) /
        100;

      return {
        id: timeslotId,
        startTime: `${String(timeslotId - 1).padStart(2, '0')}:00:00`, // Usar timeslotId-1 para el tiempo
        endTime: `${String(timeslotId - 1).padStart(2, '0')}:59:59`, // Usar timeslotId-1 para el tiempo
        isAvailableInAllDates: availableCount === dateAvailabilities.length,
        availableInDatesCount: availableCount,
        occupiedInDatesCount: occupiedCount,
        availabilityPercentage,
      };
    });
  }

  /**
   * Obtiene disponibilidad de timeslots para una fecha específica
   */
  getAvailabilityForDate(
    date: Date,
    allTimeslotIds: number[],
    occupiedInstances: Array<{
      timeslotId: number;
      reservationId: number;
      userId: number;
      reservationStateId: number;
    }>,
  ): DateAvailability {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    // Filtrar solo instancias activas (PENDIENTE o CONFIRMADA)
    const activeOccupiedInstances = occupiedInstances.filter(
      (instance) =>
        instance.reservationStateId === 1 || instance.reservationStateId === 2,
    );

    const occupiedTimeslotIds = activeOccupiedInstances.map(
      (instance) => instance.timeslotId,
    );
    const availableTimeslotIds = allTimeslotIds.filter(
      (id) => !occupiedTimeslotIds.includes(id),
    );

    // Crear detalle de disponibilidad por timeslot
    const timeslotAvailability: TimeslotAvailability[] = allTimeslotIds.map(
      (timeslotId) => {
        const occupiedInstance = activeOccupiedInstances.find(
          (instance) => instance.timeslotId === timeslotId,
        );

        return {
          timeslotId,
          isAvailable: !occupiedInstance,
          conflictingReservationId: occupiedInstance?.reservationId,
          conflictingUserId: occupiedInstance?.userId,
        };
      },
    );

    return {
      date: dateStr,
      dayOfWeek,
      availableTimeslotIds,
      occupiedTimeslotIds,
      timeslotAvailability,
    };
  }

  /**
   * Obtiene disponibilidad para múltiples fechas
   */
  getAvailabilityForDateRange(
    dates: Date[],
    allTimeslotIds: number[],
    occupiedInstancesByDate: Map<
      string,
      Array<{
        timeslotId: number;
        reservationId: number;
        userId: number;
        reservationStateId: number;
      }>
    >,
  ): DateAvailability[] {
    return dates.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const occupiedInstances = occupiedInstancesByDate.get(dateStr) || [];

      return this.getAvailabilityForDate(
        date,
        allTimeslotIds,
        occupiedInstances,
      );
    });
  }

  /**
   * Verifica si todos los timeslots están disponibles para todas las fechas
   */
  areAllTimeslotsAvailable(
    dates: Date[],
    timeslotIds: number[],
    occupiedInstancesByDate: Map<
      string,
      Array<{
        timeslotId: number;
        reservationStateId: number;
      }>
    >,
  ): boolean {
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      const occupiedInstances = occupiedInstancesByDate.get(dateStr) || [];

      // Filtrar solo instancias activas
      const activeOccupiedTimeslots = occupiedInstances
        .filter(
          (instance) =>
            instance.reservationStateId === 1 ||
            instance.reservationStateId === 2,
        )
        .map((instance) => instance.timeslotId);

      // Verificar si algún timeslot requerido está ocupado
      const hasConflict = timeslotIds.some((timeslotId) =>
        activeOccupiedTimeslots.includes(timeslotId),
      );

      if (hasConflict) {
        return false;
      }
    }

    return true;
  }

  /**
   * Encuentra el primer slot disponible en un rango de fechas
   */
  findFirstAvailableSlot(
    dates: Date[],
    timeslotIds: number[],
    occupiedInstancesByDate: Map<
      string,
      Array<{
        timeslotId: number;
        reservationStateId: number;
      }>
    >,
  ): { date: Date; timeslotId: number } | null {
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      const occupiedInstances = occupiedInstancesByDate.get(dateStr) || [];

      const activeOccupiedTimeslots = occupiedInstances
        .filter(
          (instance) =>
            instance.reservationStateId === 1 ||
            instance.reservationStateId === 2,
        )
        .map((instance) => instance.timeslotId);

      for (const timeslotId of timeslotIds) {
        if (!activeOccupiedTimeslots.includes(timeslotId)) {
          return { date: new Date(date), timeslotId };
        }
      }
    }

    return null;
  }

  /**
   * Calcula estadísticas de disponibilidad
   */
  calculateAvailabilityStats(dateAvailabilities: DateAvailability[]): {
    totalDates: number;
    totalTimeslots: number;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    availabilityPercentage: number;
    datesWithFullAvailability: number;
    datesWithNoAvailability: number;
  } {
    if (dateAvailabilities.length === 0) {
      return {
        totalDates: 0,
        totalTimeslots: 0,
        totalSlots: 0,
        availableSlots: 0,
        occupiedSlots: 0,
        availabilityPercentage: 0,
        datesWithFullAvailability: 0,
        datesWithNoAvailability: 0,
      };
    }

    const totalDates = dateAvailabilities.length;
    const totalTimeslots = dateAvailabilities[0].timeslotAvailability.length;
    const totalSlots = totalDates * totalTimeslots;

    let availableSlots = 0;
    let datesWithFullAvailability = 0;
    let datesWithNoAvailability = 0;

    for (const dateAvailability of dateAvailabilities) {
      const availableCount = dateAvailability.availableTimeslotIds.length;
      availableSlots += availableCount;

      if (availableCount === totalTimeslots) {
        datesWithFullAvailability++;
      } else if (availableCount === 0) {
        datesWithNoAvailability++;
      }
    }

    const occupiedSlots = totalSlots - availableSlots;
    const availabilityPercentage =
      totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;

    return {
      totalDates,
      totalTimeslots,
      totalSlots,
      availableSlots,
      occupiedSlots,
      availabilityPercentage: Math.round(availabilityPercentage * 100) / 100,
      datesWithFullAvailability,
      datesWithNoAvailability,
    };
  }
}
