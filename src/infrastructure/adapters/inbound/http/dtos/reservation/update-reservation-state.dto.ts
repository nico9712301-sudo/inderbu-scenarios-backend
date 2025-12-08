import {
  IsDefined,
  IsNumber,
  IsPositive,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReservationStateDto {
  @ApiProperty({
    example: 2,
    description:
      'ID del nuevo estado de la reserva (1=PENDIENTE, 2=CONFIRMADA, 3=CANCELADA)',
  })
  @IsDefined()
  @IsNumber()
  @IsPositive()
  readonly reservationStateId: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [124, 125, 126],
    description:
      'IDs adicionales de reservas para actualizar en lote. Se combinará con el ID del path para la operación múltiple. Máximo 50 reservas por operación.',
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @ArrayMaxSize(50, { message: 'Máximo 50 reservas adicionales por operación' })
  @ArrayUnique({ message: 'Los IDs de reservas adicionales deben ser únicos' })
  readonly additionalReservationIds?: number[];

  @ApiPropertyOptional({
    example: 'Cancelada por mantenimiento del estadio',
    description: 'Comentarios opcionales sobre el cambio de estado',
  })
  @IsOptional()
  readonly comments?: string;
}
