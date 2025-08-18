import { ApiProperty } from '@nestjs/swagger';
import { SubScenarioResponseDto } from './sub-scenario-response.dto';
import { SubScenarioImageResponseDto } from '../images/image-response.dto';

export class NamedRefDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
}

export class NamedRefWithAddressDto extends NamedRefDto {
  @ApiProperty() address!: string;
}

export class NamedRefWithNeighborhoodDto extends NamedRefWithAddressDto {
  @ApiProperty({ type: () => NamedRefDto })
  neighborhood!: NamedRefDto;
}

export class SubScenarioImagesDto {
  @ApiProperty({
    type: SubScenarioImageResponseDto,
    nullable: true,
    description: 'Imagen destacada del sub-escenario (si existe)',
  })
  featured?: SubScenarioImageResponseDto;

  @ApiProperty({
    type: [SubScenarioImageResponseDto],
    description: 'Imágenes adicionales (no destacadas) del sub-escenario',
  })
  additional: SubScenarioImageResponseDto[];

  @ApiProperty({
    description: 'Número total de imágenes asociadas a este sub-escenario',
  })
  count: number;
}

export class SubScenarioWithRelationsDto extends SubScenarioResponseDto {
  @ApiProperty({ type: () => NamedRefWithNeighborhoodDto })
  scenario!: NamedRefWithNeighborhoodDto;

  @ApiProperty({ required: false, type: () => NamedRefDto })
  activityArea?: NamedRefDto;

  @ApiProperty({ required: false, type: () => NamedRefDto })
  fieldSurfaceType?: NamedRefDto;

  @ApiProperty({
    type: SubScenarioImagesDto,
    required: false,
    description: 'Imágenes del sub-escenario organizadas por tipo',
  })
  imageGallery?: SubScenarioImagesDto;
}
