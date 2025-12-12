import { IsNumber, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubScenarioPriceDto {
  @ApiProperty({
    description: 'ID del sub-escenario',
    example: 1,
    minimum: 1,
  })
  @IsNumber({}, { message: 'El ID del sub-escenario debe ser un número' })
  @Min(1, { message: 'El ID del sub-escenario debe ser mayor a 0' })
  subScenarioId: number;

  @ApiProperty({
    description: 'Precio por hora en pesos mexicanos',
    example: 150.00,
    minimum: 0,
    maximum: 10000,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Max(10000, { message: 'El precio no puede exceder $10,000 por hora' })
  hourlyPrice: number;
}