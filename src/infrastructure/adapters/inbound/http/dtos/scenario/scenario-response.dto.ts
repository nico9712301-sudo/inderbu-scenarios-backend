import { ApiProperty } from '@nestjs/swagger';
import { NeighborhoodResponseDto } from '../neighborhood/neighborhood-response.dto';

export class ScenarioResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único' })
  id: number;

  @ApiProperty({ example: 'Cancha El Recreo', description: 'Nombre del escenario' })
  name: string;

  @ApiProperty({ example: '123 Calle Principal', description: 'Dirección del escenario' })
  address: string;

  @ApiProperty({ type: NeighborhoodResponseDto, description: 'Barrio donde se ubica' })
  neighborhood?: NeighborhoodResponseDto;

  @ApiProperty({ example: true, description: 'Estado del escenario' })
  active: boolean;
}
