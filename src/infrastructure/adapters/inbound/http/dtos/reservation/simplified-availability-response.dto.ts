import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO para un timeslot individual con información básica de disponibilidad
 */
export class TimeSlotBasicDto {
  @ApiProperty({ example: 9 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: '09:00:00' })
  @Expose()
  readonly startTime: string;

  @ApiProperty({ example: '09:59:59' })
  @Expose()
  readonly endTime: string;

  @ApiProperty({
    example: true,
    description: 'Verdadero si está disponible en TODAS las fechas calculadas',
  })
  @Expose()
  readonly isAvailableInAllDates: boolean;
}

/**
 * DTO para la configuración solicitada
 */
export class RequestedConfigurationDto {
  @ApiProperty({ example: '2025-06-10' })
  @Expose()
  readonly initialDate: string;

  @ApiPropertyOptional({ example: '2025-06-20' })
  @Expose()
  readonly finalDate?: string;

  @ApiPropertyOptional({
    example: [1, 3, 5],
    description: '0=Domingo, 1=Lunes, etc.',
  })
  @Expose()
  readonly weekdays?: number[];
}

/**
 * DTO para estadísticas de disponibilidad
 */
export class AvailabilityStatsDto {
  @ApiProperty({ example: 5, description: 'Número total de fechas calculadas' })
  @Expose()
  readonly totalDates: number;

  @ApiProperty({
    example: 24,
    description: 'Número total de timeslots por día',
  })
  @Expose()
  readonly totalTimeslots: number;

  @ApiProperty({
    example: 120,
    description: 'Total de slots (fechas × timeslots)',
  })
  @Expose()
  readonly totalSlots: number;

  @ApiProperty({ example: 96, description: 'Número de slots disponibles' })
  @Expose()
  readonly availableSlots: number;

  @ApiProperty({ example: 24, description: 'Número de slots ocupados' })
  @Expose()
  readonly occupiedSlots: number;

  @ApiProperty({
    example: 80.0,
    description: 'Porcentaje global de disponibilidad',
  })
  @Expose()
  readonly globalAvailabilityPercentage: number;

  @ApiProperty({ example: 2, description: 'Fechas con 100% de disponibilidad' })
  @Expose()
  readonly datesWithFullAvailability: number;

  @ApiProperty({ example: 0, description: 'Fechas sin disponibilidad' })
  @Expose()
  readonly datesWithNoAvailability: number;
}

/**
 * DTO principal para respuesta de disponibilidad simplificada
 */
export class SimplifiedAvailabilityResponseDto {
  @ApiProperty({ example: 16 })
  @Expose()
  readonly subScenarioId: number;

  @ApiProperty({ type: RequestedConfigurationDto })
  @Expose()
  @Type(() => RequestedConfigurationDto)
  readonly requestedConfiguration: RequestedConfigurationDto;

  @ApiProperty({
    example: [
      '2025-06-10',
      '2025-06-12',
      '2025-06-14',
      '2025-06-17',
      '2025-06-19',
    ],
    description: 'Fechas calculadas basadas en la configuración solicitada',
  })
  @Expose()
  readonly calculatedDates: string[];

  @ApiProperty({
    type: [TimeSlotBasicDto],
    description: 'Información básica de cada timeslot con su disponibilidad',
  })
  @Expose()
  @Type(() => TimeSlotBasicDto)
  readonly timeSlots: TimeSlotBasicDto[];

  @ApiProperty({ type: AvailabilityStatsDto })
  @Expose()
  @Type(() => AvailabilityStatsDto)
  readonly stats: AvailabilityStatsDto;

  @ApiPropertyOptional({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly queriedAt?: string;
}
