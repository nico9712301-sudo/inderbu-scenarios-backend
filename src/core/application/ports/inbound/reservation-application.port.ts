import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { SimplifiedAvailabilityResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/reservation/simplified-availability-response.dto';
import { AvailabilityQueryDto } from '../../../../infrastructure/adapters/inbound/http/dtos/reservation/availability-query.dto';
import { CreateReservationRequestDto } from '../../../../infrastructure/adapters/inbound/http/dtos/reservation/create-reservation-request.dto';
import { ReservationPageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/reservation/reservation-page-options.dto';
import {
  CreateReservationResponseDto,
  ReservationWithDetailsResponseDto,
} from '../../../../infrastructure/adapters/inbound/http/dtos/reservation/reservation.dto';
import { BulkUpdateReservationStateResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/reservation/bulk-update-reservation-state-response.dto';

export interface UpdateReservationStateDto {
  stateId: number;
  comments?: string;
}

export interface UpdateMultipleReservationStatesDto {
  reservationIds: number[];
  stateId: number;
  comments?: string;
}

export interface IReservationApplicationPort {
  /**
   * Crea una nueva reserva (simple o compleja)
   */
  createReservation(
    dto: CreateReservationRequestDto,
    userId: number,
  ): Promise<CreateReservationResponseDto>;

  /**
   * Obtiene disponibilidad simplificada para configuración de reserva
   */
  getAvailabilityForConfiguration(
    query: AvailabilityQueryDto,
  ): Promise<SimplifiedAvailabilityResponseDto>;

  /**
   * Lista reservas con filtros y paginación
   */
  listReservations(
    options: ReservationPageOptionsDto,
  ): Promise<PageDto<ReservationWithDetailsResponseDto>>;

  /**
   * Obtiene una reserva por ID
   */
  getReservationById(id: number): Promise<ReservationWithDetailsResponseDto>;

  /**
   * Actualiza el estado de una reserva
   */
  updateReservationState(
    reservationId: number,
    dto: UpdateReservationStateDto,
  ): Promise<ReservationWithDetailsResponseDto>;

  /**
   * Actualiza el estado de múltiples reservas
   */
  updateMultipleReservationStates(
    dto: UpdateMultipleReservationStatesDto,
  ): Promise<BulkUpdateReservationStateResponseDto>;

  /**
   * Cancela una reserva
   */
  cancelReservation(
    reservationId: number,
  ): Promise<ReservationWithDetailsResponseDto>;

  /**
   * Confirma una reserva
   * @param reservationId - ID de la reserva
   * @param justification - Justificación requerida si es reserva pagada sin comprobante
   */
  confirmReservation(
    reservationId: number,
    justification?: string,
  ): Promise<ReservationWithDetailsResponseDto>;

  /**
   * Obtiene el estado de confirmación de una reserva
   * @param reservationId - ID de la reserva
   * @returns Información sobre si puede ser confirmada, si requiere justificación, etc.
   */
  getConfirmationStatus(reservationId: number): Promise<{
    canConfirm: boolean;
    requiresJustification: boolean;
    hasPaymentProofs: boolean;
    hasCost: boolean;
    message?: string | null;
  }>;

  /**
   * Obtiene estadísticas de reservas
   */
  getReservationStats(): Promise<{
    totalReservations: number;
    totalInstances: number;
    reservationsByState: Record<string, number>;
    reservationsByType: Record<string, number>;
  }>;
}
