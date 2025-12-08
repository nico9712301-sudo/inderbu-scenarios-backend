import { ApiProperty } from '@nestjs/swagger';

export class SubScenarioStatsDto {
  @ApiProperty({
    description: 'Número total de sub-escenarios que cumplen los filtros',
    example: 40,
  })
  count: number;
}
