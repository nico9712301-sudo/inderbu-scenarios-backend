import { ApiProperty } from '@nestjs/swagger';

export class SubScenarioImageResponseDto {
  @ApiProperty({ description: 'ID único de la imagen' })
  id: number;

  @ApiProperty({ description: 'Ruta del archivo de imagen en el servidor' })
  path: string;

  @ApiProperty({ description: 'URL completa de la imagen' })
  url: string;

  @ApiProperty({
    description:
      'Indica si esta imagen es la destacada (principal) del sub-escenario',
  })
  isFeature: boolean;

  @ApiProperty({ description: 'Orden de visualización de la imagen' })
  displayOrder: number;

  @ApiProperty({
    description: 'ID del sub-escenario al que pertenece esta imagen',
  })
  subScenarioId: number;

  @ApiProperty({
    description: 'Indica si esta imagen es la versión actual (no histórica)',
  })
  current: boolean;

  @ApiProperty({
    required: false,
    description: 'Fecha de creación de la imagen',
  })
  createdAt?: Date;
}
