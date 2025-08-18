import { IsDefined, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
