import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

export class CreateCommuneDto {
  @ApiProperty({
    description: 'Nombre de la comuna',
    example: 'COMUNA 1',
    minLength: 3,
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  @ApiProperty({
    description: 'ID de la ciudad a la que pertenece la comuna',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la ciudad es requerido' })
  @IsNumber({}, { message: 'El ID de la ciudad debe ser un número' })
  cityId: number;
}
