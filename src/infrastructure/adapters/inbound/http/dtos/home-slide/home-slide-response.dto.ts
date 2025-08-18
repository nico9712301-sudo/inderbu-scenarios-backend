import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomeSlideType } from 'src/core/domain/entities/home-slide/home-slide.entity';

export class HomeSlideResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the slide',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the slide',
    example: 'Welcome to INDERBU',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the slide',
    example: 'Discover amazing sports facilities in Buenaventura',
  })
  description: string | null;

  @ApiProperty({
    description: 'URL of the slide image',
    example: 'https://example.com/image.jpg',
  })
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Link URL when slide is clicked',
    example: 'https://example.com/reservations',
  })
  linkUrl: string | null;

  @ApiProperty({
    description: 'Display order of the slide',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether the slide is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Type of slide',
    enum: HomeSlideType,
    example: HomeSlideType.BANNER,
  })
  slideType: HomeSlideType;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}