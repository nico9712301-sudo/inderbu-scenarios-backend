import { IsNumber, IsPositive, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubScenarioPriceDto {
  @ApiProperty({
    description: 'Nuevo precio por hora en pesos mexicanos',
    example: 175.50,
    minimum: 0,
    maximum: 10000,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Max(10000, { message: 'El precio no puede exceder $10,000 por hora' })
  hourlyPrice: number;
}