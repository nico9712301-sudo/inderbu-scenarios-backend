import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ValidateNested,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReservationRangeDto {
  @ApiProperty({
    example: '2025-06-09',
    description: 'Fecha inicial del rango (YYYY-MM-DD)',
  })
  @IsDefined()
  @IsDateString()
  @IsNotEmpty()
  readonly initialDate: string;

  @ApiProperty({
    example: '2025-06-17',
    description:
      'Fecha final del rango (YYYY-MM-DD). Opcional para reservas de un solo día.',
    required: false,
  })
  @IsOptional() // 🛡️ FIXED: Hacer finalDate opcional para reservas de un solo día
  @IsDateString()
  readonly finalDate?: string; // 🛡️ FIXED: Cambiar a opcional con ?
}

export class CreateReservationRequestDto {
  @ApiProperty({
    example: 16,
    description: 'ID del sub-escenario a reservar',
  })
  @IsDefined()
  @IsNumber()
  @IsPositive()
  readonly subScenarioId: number;

  @ApiProperty({
    example: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    description: 'Array de IDs de time slots a reservar',
    type: [Number],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  readonly timeSlotIds: number[];

  @ApiProperty({
    example: { initialDate: '2025-06-09', finalDate: '2025-06-17' },
    description:
      'Rango de fechas para la reserva (opcional para reserva de un solo día)',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationRangeDto)
  readonly reservationRange?: ReservationRangeDto;

  @ApiProperty({
    example: [1, 3, 5],
    description:
      'Días de la semana (1=Lunes, 2=Martes, ..., 7=Domingo). Solo requerido para reservas de rango.',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  readonly weekdays?: number[];

  @ApiProperty({
    example: '2025-06-09',
    description:
      'Fecha única para reserva de un solo día (YYYY-MM-DD). Alternativa a reservationRange.',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  readonly singleDate?: string;

  @ApiProperty({
    example: 'Reserva para evento especial',
    description: 'Comentarios adicionales sobre la reserva',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly comments?: string;
}
