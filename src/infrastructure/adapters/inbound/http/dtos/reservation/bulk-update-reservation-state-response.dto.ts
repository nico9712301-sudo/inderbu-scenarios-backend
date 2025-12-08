import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationWithDetailsResponseDto } from './reservation.dto';

export class BulkUpdateErrorDto {
  @ApiProperty({
    example: 123,
    description: 'ID de la reserva que falló al actualizarse',
  })
  reservationId: number;

  @ApiProperty({
    example: 'Reserva no encontrada',
    description: 'Motivo del error',
  })
  error: string;
}

export class BulkUpdateReservationStateResponseDto {
  @ApiProperty({
    example: 3,
    description: 'Número de reservas actualizadas exitosamente',
  })
  updatedCount: number;

  @ApiProperty({
    example: 4,
    description: 'Número total de reservas procesadas',
  })
  totalProcessed: number;

  @ApiProperty({
    type: [ReservationWithDetailsResponseDto],
    description: 'Reservas actualizadas exitosamente con sus detalles',
  })
  updatedReservations: ReservationWithDetailsResponseDto[];

  @ApiPropertyOptional({
    type: [BulkUpdateErrorDto],
    description: 'Errores ocurridos durante la actualización, si los hay',
  })
  errors?: BulkUpdateErrorDto[];

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si todas las reservas se actualizaron exitosamente',
  })
  allSuccessful: boolean;
}
