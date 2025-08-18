import { ApiProperty } from '@nestjs/swagger';

export class SubScenarioResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  hasCost: boolean;

  @ApiProperty({ required: false })
  numberOfSpectators?: number;

  @ApiProperty({ required: false })
  numberOfPlayers?: number;

  @ApiProperty({ required: false })
  recommendations?: string;

  @ApiProperty({ description: 'Id del escenario al que pertenece' })
  scenarioId?: number;

  @ApiProperty({
    required: false,
    description: 'Id del área de actividad asociada',
  })
  activityAreaId?: number;

  @ApiProperty({ required: false, description: 'Id del tipo de superficie' })
  fieldSurfaceTypeId?: number;

  @ApiProperty({ required: false })
  createdAt?: Date;
}
