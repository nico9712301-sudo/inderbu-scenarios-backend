import { Injectable } from '@nestjs/common';

export interface ReservationConflict {
  date: Date;
  timeslotId: number;
  conflictingReservationId: number;
  conflictingUserId: number;
}

export interface ReservationInstanceForConflictCheck {
  reservationId: number;
  timeslotId: number;
  reservationDate: Date;
  subScenarioId: number;
  userId: number;
  reservationStateId: number;
}

/**
 * Domain Service para detectar conflictos entre reservas
 */
@Injectable()
export class ReservationConflictDetectorDomainService {
  /**
   * Método simplificado para detectar conflictos desde Application Service
   */
  detectConflictsForNewReservation(
    _subScenarioId: number,
    _timeslotIds: number[],
    _reservationDates: Date[],
  ): Promise<ReservationConflict[]> {
    // Por ahora retornamos array vacío
    // En una implementación completa, aquí consultaríamos el repositorio
    // para obtener las instancias existentes
    return Promise.resolve([]);
  }

  /**
   * Detecta conflictos entre una nueva reserva y las instancias existentes
   */
  detectConflicts(
    subScenarioId: number,
    timeslotIds: number[],
    reservationDates: Date[],
    existingInstances: ReservationInstanceForConflictCheck[],
  ): ReservationConflict[] {
    const conflicts: ReservationConflict[] = [];

    for (const date of reservationDates) {
      for (const timeslotId of timeslotIds) {
        const conflict = this.findConflictForDateAndTimeslot(
          subScenarioId,
          date,
          timeslotId,
          existingInstances,
        );

        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * Busca conflicto específico para una fecha y timeslot
   */
  private findConflictForDateAndTimeslot(
    subScenarioId: number,
    date: Date,
    timeslotId: number,
    existingInstances: ReservationInstanceForConflictCheck[],
  ): ReservationConflict | null {
    const conflict = existingInstances.find(
      (instance) =>
        instance.subScenarioId === subScenarioId &&
        this.isSameDate(instance.reservationDate, date) &&
        instance.timeslotId === timeslotId &&
        this.activeReservation(instance.reservationStateId),
    );

    if (conflict) {
      return {
        date,
        timeslotId,
        conflictingReservationId: conflict.reservationId,
        conflictingUserId: conflict.userId,
      };
    }

    return null;
  }

  /**
   * Verifica si dos fechas son iguales (solo día, sin hora)
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0]
    );
  }

  /**
   * Verifica si una reserva está activa (PENDIENTE o CONFIRMADA)
   */
  private activeReservation(reservationStateId: number): boolean {
    return reservationStateId === 1 || reservationStateId === 2; // PENDIENTE o CONFIRMADA
  }

  /**
   * Formatea conflictos para mostrar al usuario
   */
  formatConflictsForUser(conflicts: ReservationConflict[]): string {
    if (conflicts.length === 0) {
      return '';
    }

    const conflictDetails = conflicts
      .map(
        (conflict) =>
          `${conflict.date.toISOString().split('T')[0]} - TimeSlot ${conflict.timeslotId}`,
      )
      .join(', ');

    return `Conflictos detectados en las siguientes fechas/horarios: ${conflictDetails}`;
  }

  /**
   * Agrupa conflictos por fecha para mejor visualización
   */
  groupConflictsByDate(
    conflicts: ReservationConflict[],
  ): Map<string, ReservationConflict[]> {
    const grouped = new Map<string, ReservationConflict[]>();

    for (const conflict of conflicts) {
      const dateKey = conflict.date.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(conflict);
    }

    return grouped;
  }
}
