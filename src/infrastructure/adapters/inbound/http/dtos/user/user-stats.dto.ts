import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({
    description: 'Número total de usuarios que cumplen los filtros',
    example: 25,
  })
  count: number;
}