import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  TimeslotDto,
  SubScenarioDto,
  UserDto,
  ReservationStateDto,
  ReservationInstanceDto,
} from './base-reservation.dto';

/**
 * DTO principal de Reserva
 * Usado para CREATE, GET, LIST con diferentes niveles de exposición
 */
export class ReservationDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 16 })
  @Expose()
  readonly subScenarioId: number;

  @ApiProperty({ example: 123 })
  @Expose()
  readonly userId: number;

  @ApiProperty({ example: 'RANGE', enum: ['SINGLE', 'RANGE'] })
  @Expose()
  readonly type: string;

  @ApiProperty({ example: '2025-06-09' })
  @Expose()
  readonly initialDate: string;

  @ApiPropertyOptional({ example: '2025-06-17' })
  @Expose()
  readonly finalDate: string | null;

  @ApiPropertyOptional({ example: [1, 3, 5] })
  @Expose()
  readonly weekDays: number[] | null;

  @ApiPropertyOptional({ example: 'Reserva para evento especial' })
  @Expose()
  readonly comments: string | null;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly reservationStateId: number;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly createdAt: string;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly updatedAt: string;

  // ========================================
  // CAMPOS OPCIONALES CON @Expose() CONDICIONAL
  // ========================================

  /**
   * Solo se expone en respuestas detalladas
   * No en listas paginadas por performance
   */
  @ApiPropertyOptional({ type: [TimeslotDto] })
  @Expose({ groups: ['detailed', 'create'] })
  @Type(() => TimeslotDto)
  readonly timeslots?: TimeslotDto[];

  /**
   * Solo se expone cuando se incluyen instancias
   */
  @ApiPropertyOptional({ type: [ReservationInstanceDto] })
  @Expose({ groups: ['detailed', 'create', 'instances'] })
  @Type(() => ReservationInstanceDto)
  readonly instances?: ReservationInstanceDto[];

  /**
   * Información del sub-escenario (solo en vistas detalladas)
   */
  @ApiPropertyOptional({ type: SubScenarioDto })
  @Expose({ groups: ['detailed', 'relations'] })
  @Type(() => SubScenarioDto)
  readonly subScenario?: SubScenarioDto;

  /**
   * Información del usuario (solo en vistas admin)
   */
  @ApiPropertyOptional({ type: UserDto })
  @Expose({ groups: ['detailed', 'admin'] })
  @Type(() => UserDto)
  readonly user?: UserDto;

  /**
   * Información del estado (solo en vistas detalladas)
   */
  @ApiPropertyOptional({ type: ReservationStateDto })
  @Expose({ groups: ['detailed', 'admin'] })
  @Type(() => ReservationStateDto)
  readonly reservationState?: ReservationStateDto;

  // ========================================
  // CAMPOS CALCULADOS
  // ========================================

  /**
   * Total de instancias calculado
   */
  @ApiPropertyOptional({ example: 36 })
  @Expose({ groups: ['detailed', 'create', 'summary'] })
  @Transform(({ obj }) => {
    if (obj.instances) return obj.instances.length;
    if (obj.timeslots && obj.type === 'RANGE') {
      // Calcular basado en fechas y timeslots
      return obj.timeslots.length * (obj.weekDays?.length || 1);
    }
    return obj.timeslots?.length || 0;
  })
  readonly totalInstances?: number;

  /**
   * Nombre del estado de reserva (calculado)
   */
  @ApiPropertyOptional({ example: 'PENDIENTE' })
  @Expose({ groups: ['detailed', 'list'] })
  @Transform(({ obj }) => obj.reservationState?.name || 'UNKNOWN')
  readonly reservationStateName?: string;
}

// ========================================
// CLASES ESPECIFICAS SIN HERENCIA PROBLEMÁTICA
// ========================================

/**
 * Para respuesta de CREATE (incluye timeslots e instances)
 */
export class CreateReservationResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 16 })
  @Expose()
  readonly subScenarioId: number;

  @ApiProperty({ example: 123 })
  @Expose()
  readonly userId: number;

  @ApiProperty({ example: 'RANGE', enum: ['SINGLE', 'RANGE'] })
  @Expose()
  readonly type: string;

  @ApiProperty({ example: '2025-06-09' })
  @Expose()
  readonly initialDate: string;

  @ApiPropertyOptional({ example: '2025-06-17' })
  @Expose()
  readonly finalDate: string | null;

  @ApiPropertyOptional({ example: [1, 3, 5] })
  @Expose()
  readonly weekDays: number[] | null;

  @ApiPropertyOptional({ example: 'Reserva para evento especial' })
  @Expose()
  readonly comments: string | null;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly reservationStateId: number;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly createdAt: string;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly updatedAt: string;

  @ApiProperty({ type: [TimeslotDto] })
  @Expose()
  @Type(() => TimeslotDto)
  readonly timeslots: TimeslotDto[];

  @ApiProperty({ type: [ReservationInstanceDto] })
  @Expose()
  @Type(() => ReservationInstanceDto)
  readonly instances: ReservationInstanceDto[];

  @ApiProperty({ example: 36 })
  @Expose()
  readonly totalInstances: number;
}

/**
 * Para respuesta de GET detallada (incluye relaciones)
 */
export class ReservationWithDetailsResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 16 })
  @Expose()
  readonly subScenarioId: number;

  @ApiProperty({ example: 123 })
  @Expose()
  readonly userId: number;

  @ApiProperty({ example: 'RANGE', enum: ['SINGLE', 'RANGE'] })
  @Expose()
  readonly type: string;

  @ApiProperty({ example: '2025-06-09' })
  @Expose()
  readonly initialDate: string;

  @ApiPropertyOptional({ example: '2025-06-17' })
  @Expose()
  readonly finalDate: string | null;

  @ApiPropertyOptional({ example: [1, 3, 5] })
  @Expose()
  readonly weekDays: number[] | null;

  @ApiPropertyOptional({ example: 'Reserva para evento especial' })
  @Expose()
  readonly comments: string | null;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly reservationStateId: number;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly createdAt: string;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly updatedAt: string;

  @ApiProperty({ type: SubScenarioDto })
  @Expose()
  @Type(() => SubScenarioDto)
  readonly subScenario: SubScenarioDto;

  @ApiProperty({ type: UserDto })
  @Expose()
  @Type(() => UserDto)
  readonly user: UserDto;

  @ApiProperty({ type: ReservationStateDto })
  @Expose()
  @Type(() => ReservationStateDto)
  readonly reservationState: ReservationStateDto;

  @ApiProperty({ type: [TimeslotDto] })
  @Expose()
  @Type(() => TimeslotDto)
  readonly timeslots: TimeslotDto[];

  @ApiProperty({ example: 36 })
  @Expose()
  readonly totalInstances: number;
}

/**
 * Para listas paginadas (solo campos básicos)
 */
export class ReservationListItemDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 16 })
  @Expose()
  readonly subScenarioId: number;

  @ApiProperty({ example: 123 })
  @Expose()
  readonly userId: number;

  @ApiProperty({ example: 'RANGE', enum: ['SINGLE', 'RANGE'] })
  @Expose()
  readonly type: string;

  @ApiProperty({ example: '2025-06-09' })
  @Expose()
  readonly initialDate: string;

  @ApiPropertyOptional({ example: '2025-06-17' })
  @Expose()
  readonly finalDate: string | null;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly reservationStateId: number;

  @ApiProperty({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly createdAt: string;

  @ApiPropertyOptional({ example: 'PENDIENTE' })
  @Expose()
  readonly reservationStateName?: string;
}

// Type aliases para backward compatibility
export type TimeSlotInfoDto = TimeslotDto;
export type SubScenarioInfoDto = SubScenarioDto;
export type UserInfoDto = UserDto;
export type ReservationStateInfoDto = ReservationStateDto;
