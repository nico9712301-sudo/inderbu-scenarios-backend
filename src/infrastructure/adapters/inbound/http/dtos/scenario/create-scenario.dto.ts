import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateScenarioDto {
  @ApiProperty({
    description: 'Nombre del escenario',
    example: 'Polideportivo Norte',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Dirección del escenario',
    example: 'Calle 123 #45-67',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(150, { message: 'La dirección no puede exceder 150 caracteres' })
  address: string;

  @ApiProperty({
    description: 'ID del barrio donde se encuentra el escenario',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  neighborhoodId: number;
}
