import { ApiProperty } from '@nestjs/swagger';

export class ConfirmationStatusDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la reserva puede ser confirmada',
  })
  readonly canConfirm: boolean;

  @ApiProperty({
    example: false,
    description:
      'Indica si se requiere justificación para confirmar (reserva pagada sin comprobante)',
  })
  readonly requiresJustification: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si la reserva tiene comprobantes de pago subidos',
  })
  readonly hasPaymentProofs: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el sub-escenario asociado tiene costo',
  })
  readonly hasCost: boolean;

  @ApiProperty({
    example: 'Esta reserva requiere un comprobante de pago o una justificación para ser confirmada',
    description: 'Mensaje explicativo sobre el estado de confirmación',
    nullable: true,
  })
  readonly message?: string | null;
}

