import { ApiProperty } from '@nestjs/swagger';

export class FieldSurfaceTypeResponseDto {
  @ApiProperty({ description: 'ID único del tipo de superficie', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nombre del tipo de superficie',
    example: 'Césped',
  })
  name: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-05-18T23:44:39.925Z',
    required: false,
  })
  createdAt?: Date;
}
