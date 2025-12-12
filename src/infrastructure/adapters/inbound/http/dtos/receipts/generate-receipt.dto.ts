import { IsNumber, IsOptional, IsEmail, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReceiptDto {
  @ApiProperty({
    description: 'ID de la reservación',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID de la reservación debe ser un número' })
  @Min(1, { message: 'El ID de la reservación debe ser mayor a 0' })
  reservationId: number;

  @ApiProperty({
    description: 'ID de la plantilla a usar',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID de la plantilla debe ser un número' })
  @Min(1, { message: 'El ID de la plantilla debe ser mayor a 0' })
  templateId: number;

  @ApiPropertyOptional({
    description: 'Email del cliente (opcional)',
    example: 'cliente@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  customerEmail?: string;
}