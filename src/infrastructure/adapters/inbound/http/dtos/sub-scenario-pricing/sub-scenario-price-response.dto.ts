import { ApiProperty } from '@nestjs/swagger';

export class SubScenarioPriceResponseDto {
  @ApiProperty({
    description: 'ID único del precio',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID del sub-escenario',
    example: 5,
  })
  subScenarioId: number;

  @ApiProperty({
    description: 'Precio por hora en pesos mexicanos',
    example: 150.00,
  })
  hourlyPrice: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-12-12T06:45:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-12-12T06:45:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Precio formateado para mostrar',
    example: '$150.00 MXN',
  })
  formattedPrice: string;
}