import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TimeslotAvailabilityDetailDto {
  @ApiProperty({ example: 9 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: '09:00:00' })
  @Expose()
  readonly startTime: string;

  @ApiProperty({ example: '09:59:59' })
  @Expose()
  readonly endTime: string;

  @ApiProperty({ example: true })
  @Expose()
  readonly isAvailableInAllDates: boolean;

  @ApiProperty({ example: 3 })
  @Expose()
  readonly availableInDatesCount: number;

  @ApiProperty({ example: 2 })
  @Expose()
  readonly occupiedInDatesCount: number;

  @ApiProperty({ example: 60.0 })
  @Expose()
  readonly availabilityPercentage: number;
}

export class DateAvailabilityDto {
  @ApiProperty({ example: '2025-06-10' })
  @Expose()
  readonly date: string;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly dayOfWeek: number;

  @ApiProperty({ example: [0, 1, 2, 6, 7, 8] })
  @Expose()
  readonly availableTimeslotIds: number[];

  @ApiProperty({ example: [3, 4, 5, 9, 10, 11] })
  @Expose()
  readonly occupiedTimeslotIds: number[];

  @ApiProperty({ example: 6 })
  @Expose()
  readonly totalAvailable: number;

  @ApiProperty({ example: 18 })
  @Expose()
  readonly totalOccupied: number;

  @ApiProperty({ example: 25.0 })
  @Expose()
  readonly availabilityPercentage: number;
}

export class AvailabilityStatsDto {
  @ApiProperty({ example: 5 })
  @Expose()
  readonly totalDates: number;

  @ApiProperty({ example: 24 })
  @Expose()
  readonly totalTimeslots: number;

  @ApiProperty({ example: 120 })
  @Expose()
  readonly totalSlots: number;

  @ApiProperty({ example: 72 })
  @Expose()
  readonly availableSlots: number;

  @ApiProperty({ example: 48 })
  @Expose()
  readonly occupiedSlots: number;

  @ApiProperty({ example: 60.0 })
  @Expose()
  readonly globalAvailabilityPercentage: number;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly datesWithFullAvailability: number;

  @ApiProperty({ example: 0 })
  @Expose()
  readonly datesWithNoAvailability: number;
}

export class AggregatedAvailabilityResponseDto {
  @ApiProperty({ example: 16 })
  @Expose()
  readonly subScenarioId: number;

  @ApiProperty({
    example: {
      initialDate: '2025-06-10',
      finalDate: '2025-06-20',
      weekdays: [1, 3, 5],
    },
  })
  @Expose()
  readonly requestedConfiguration: {
    initialDate: string;
    finalDate?: string;
    weekdays?: number[];
  };

  @ApiProperty({
    example: ['2025-06-10', '2025-06-12', '2025-06-16', '2025-06-19'],
  })
  @Expose()
  readonly calculatedDates: string[];

  @ApiProperty({ example: [0, 1, 2, 6, 7, 8] })
  @Expose()
  readonly availableInAllDates: number[];

  @ApiProperty({ example: [0, 1, 2, 3, 6, 7, 8, 9, 15, 16] })
  @Expose()
  readonly availableInAnyDate: number[];

  @ApiProperty({ example: [4, 5, 10, 11, 12] })
  @Expose()
  readonly occupiedInAllDates: number[];

  @ApiProperty({ type: [TimeslotAvailabilityDetailDto] })
  @Expose()
  @Type(() => TimeslotAvailabilityDetailDto)
  readonly timeslotDetails: TimeslotAvailabilityDetailDto[];

  @ApiProperty({ type: [DateAvailabilityDto] })
  @Expose()
  @Type(() => DateAvailabilityDto)
  readonly dateAvailabilities: DateAvailabilityDto[];

  @ApiProperty({ type: AvailabilityStatsDto })
  @Expose()
  @Type(() => AvailabilityStatsDto)
  readonly stats: AvailabilityStatsDto;

  @ApiPropertyOptional({ example: '2025-06-08T10:30:00Z' })
  @Expose()
  readonly queriedAt?: string;
}
