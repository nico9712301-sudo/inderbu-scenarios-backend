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

  @ApiPropertyOptional({
    description: 'Precio por hora (mínimo 1000 pesos)',
    example: 5000,
    minimum: 1000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio por hora debe ser un número' })
  @Min(1000, { message: 'El precio por hora debe ser al menos 1000 pesos' })
  hourlyPrice?: number;

  @ApiPropertyOptional({
    description: 'Costo total del recibo',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El costo total debe ser un número' })
  @Min(0, { message: 'El costo total no puede ser negativo' })
  totalCost?: number;
}