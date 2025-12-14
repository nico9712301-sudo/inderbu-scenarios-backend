import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmReservationDto {
  @ApiPropertyOptional({
    example: 'El cliente pagó en efectivo y no tiene comprobante',
    description:
      'Justificación requerida si la reserva es pagada y no tiene comprobante de pago. Máximo 500 caracteres.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La justificación no puede exceder 500 caracteres',
  })
  readonly justification?: string;
}

