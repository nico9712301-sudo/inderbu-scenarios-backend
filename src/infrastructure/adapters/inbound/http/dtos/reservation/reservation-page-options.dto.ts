import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  IsArray,
} from 'class-validator';
import { PageOptionsDto } from '../common/page-options.dto';

export class ReservationPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    example: 16,
    description: 'Filtrar por ID del sub-escenario',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  subScenarioId?: number;

  @ApiPropertyOptional({
    example: [1, 2],
    description:
      'Filtrar por IDs de estados de reserva (1=PENDIENTE, 2=CONFIRMADA, 3=CANCELADA)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  reservationStateIds?: number[];

  @ApiPropertyOptional({
    example: 'RANGE',
    description: 'Filtrar por tipo de reserva (SINGLE, RANGE)',
  })
  @IsOptional()
  type?: 'SINGLE' | 'RANGE';

  @ApiPropertyOptional({
    example: '2025-06-01',
    description: 'Fecha de inicio para filtrar reservas (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-06-30',
    description: 'Fecha de fin para filtrar reservas (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Filtrar por ID de la ciudad',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cityId?: number;
}
