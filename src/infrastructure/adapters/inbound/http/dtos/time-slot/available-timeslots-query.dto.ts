import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsDateString } from 'class-validator';

export class AvailableTimeslotsQueryDto {
  @ApiProperty({
    description: 'ID del sub‑escenario',
    example: 42,
    type: Number,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  subScenarioId: number;

  @ApiProperty({
    description: 'Fecha en formato ISO “YYYY-MM-DD”',
    example: '2025-04-20',
    type: String,
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString() // sólo acepta ISO date (sin hora)
  date: string;
}
