import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

export class UpdateCommuneDto {
  @ApiProperty({
    description: 'Nombre de la comuna',
    example: 'COMUNA 1',
    minLength: 3,
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'ID de la ciudad a la que pertenece la comuna',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de la ciudad debe ser un número' })
  cityId?: number;
}
