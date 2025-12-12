import { IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculateCostDto {
  @ApiProperty({
    description: 'ID del sub-escenario',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del sub-escenario debe ser un número' })
  @Min(1, { message: 'El ID del sub-escenario debe ser mayor a 0' })
  subScenarioId: number;

  @ApiProperty({
    description: 'Fecha y hora de inicio',
    example: '2025-12-15T10:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  startDateTime: string;

  @ApiProperty({
    description: 'Fecha y hora de fin',
    example: '2025-12-15T13:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  endDateTime: string;
}

export class CalculateCostResponseDto {
  @ApiProperty({
    description: 'Costo total calculado',
    example: 450.00,
  })
  totalCost: number;

  @ApiProperty({
    description: 'Total de horas',
    example: 3,
  })
  totalHours: number;

  @ApiProperty({
    description: 'Precio por hora',
    example: 150.00,
  })
  hourlyPrice: number;

  @ApiProperty({
    description: 'Costo formateado',
    example: '$450.00 MXN',
  })
  formattedCost: string;

  @ApiProperty({
    description: 'Indica si el sub-escenario tiene precio configurado',
    example: true,
  })
  hasPrice: boolean;
}