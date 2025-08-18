import { IsString, IsOptional, IsUrl, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomeSlideType } from 'src/core/domain/entities/home-slide/home-slide.entity';

export class CreateHomeSlideDto {
  @ApiProperty({
    description: 'Title of the slide',
    example: 'Welcome to INDERBU',
    maxLength: 255,
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the slide',
    example: 'Discover amazing sports facilities in Buenaventura',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL of the slide image',
    example: 'https://example.com/image.jpg',
    maxLength: 500,
  })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Link URL when slide is clicked',
    example: 'https://example.com/reservations',
    maxLength: 500,
  })
  @IsUrl()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional({
    description: 'Display order of the slide',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Type of slide',
    enum: HomeSlideType,
    example: HomeSlideType.BANNER,
  })
  @IsEnum(HomeSlideType)
  @IsOptional()
  slideType?: HomeSlideType;
}