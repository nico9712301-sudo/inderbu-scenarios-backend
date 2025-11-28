import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO base para información de Timeslot
 * Usado en múltiples respuestas
 */
export class TimeslotDto {
  @ApiProperty({ example: 9 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: '09:00:00' })
  @Expose()
  readonly startTime: string;

  @ApiProperty({ example: '09:59:59' })
  @Expose()
  readonly endTime: string;

  @ApiPropertyOptional({ example: true })
  @Expose()
  readonly isAvailable?: boolean;
}

/**
 * DTO para información de City
 */
export class CityDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'Medellín' })
  @Expose()
  readonly name: string;
}

/**
 * DTO para información de Commune
 */
export class CommuneDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'Comuna 14' })
  @Expose()
  readonly name: string;

  @ApiPropertyOptional({ type: CityDto })
  @Expose()
  @Type(() => CityDto)
  readonly city?: CityDto;
}

/**
 * DTO para información de Neighborhood
 */
export class NeighborhoodDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'El Poblado' })
  @Expose()
  readonly name: string;

  @ApiPropertyOptional({ type: CommuneDto })
  @Expose()
  @Type(() => CommuneDto)
  readonly commune?: CommuneDto;
}

/**
 * DTO para información completa de Scenario
 */
export class ScenarioDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'Polideportivo Central' })
  @Expose()
  readonly name: string;

  @ApiProperty({ example: 'Calle 123 #45-67' })
  @Expose()
  readonly address: string;

  @ApiPropertyOptional({ type: NeighborhoodDto })
  @Expose()
  @Type(() => NeighborhoodDto)
  readonly neighborhood?: NeighborhoodDto;
}

/**
 * DTO para información de SubScenario
 */
export class SubScenarioDto {
  @ApiProperty({ example: 16 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'Cancha de Fútbol A' })
  @Expose()
  readonly name: string;

  @ApiPropertyOptional({ example: 'Descripción del sub-escenario' })
  @Expose()
  readonly description?: string;

  // Propiedades adicionales que espera el frontend
  @ApiPropertyOptional({ example: true })
  @Expose()
  readonly hasCost?: boolean;

  @ApiPropertyOptional({ example: 22 })
  @Expose()
  readonly numberOfSpectators?: number | null;

  @ApiPropertyOptional({ example: 11 })
  @Expose()
  readonly numberOfPlayers?: number | null;

  @ApiPropertyOptional({ example: 'Recomendaciones especiales' })
  @Expose()
  readonly recommendations?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  readonly scenarioId?: number;

  @ApiPropertyOptional({ example: 'Polideportivo Central' })
  @Expose()
  readonly scenarioName?: string;

  @ApiPropertyOptional({ type: ScenarioDto })
  @Expose()
  @Type(() => ScenarioDto)
  readonly scenario?: ScenarioDto;
}

/**
 * DTO para información de Usuario
 */
export class UserDto {
  @ApiProperty({ example: 123 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'John' })
  @Expose()
  readonly firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  readonly lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  readonly email: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @Expose()
  readonly phone?: string | null;
}

/**
 * DTO para información de Estado de Reserva
 */
export class ReservationStateDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'PENDIENTE' })
  @Expose()
  readonly name: string;

  @ApiPropertyOptional({ example: 'La reserva está pendiente de confirmación' })
  @Expose()
  readonly description?: string;
}

/**
 * DTO para instancias de reserva
 */
export class ReservationInstanceDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: '2025-06-09' })
  @Expose()
  readonly reservationDate: string;

  @ApiProperty({ type: TimeslotDto })
  @Expose()
  @Type(() => TimeslotDto)
  readonly timeslot: TimeslotDto;
}
