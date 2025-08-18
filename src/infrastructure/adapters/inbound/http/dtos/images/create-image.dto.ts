import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  // Archivo 1
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Primer archivo de imagen',
  })
  file1: any;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Indica si el primer archivo es imagen destacada',
  })
  isFeature1?: boolean;

  @ApiProperty({
    required: false,
    default: 0,
    description: 'Orden de visualización del primer archivo',
  })
  displayOrder1?: number;

  // Archivo 2
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Segundo archivo de imagen (opcional)',
  })
  file2?: any;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Indica si el segundo archivo es imagen destacada',
  })
  isFeature2?: boolean;

  @ApiProperty({
    required: false,
    default: 1,
    description: 'Orden de visualización del segundo archivo',
  })
  displayOrder2?: number;

  // Archivo 3
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Tercer archivo de imagen (opcional)',
  })
  file3?: any;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Indica si el tercer archivo es imagen destacada',
  })
  isFeature3?: boolean;

  @ApiProperty({
    required: false,
    default: 2,
    description: 'Orden de visualización del tercer archivo',
  })
  displayOrder3?: number;
}
