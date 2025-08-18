import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

export class CreateNeighborhoodDto {
  @ApiProperty({
    description: 'Nombre del barrio',
    example: 'Centro',
    minLength: 3,
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  @ApiProperty({
    description: 'ID de la comuna a la que pertenece el barrio',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la comuna es requerido' })
  @IsNumber({}, { message: 'El ID de la comuna debe ser un número' })
  communeId: number;
}
