import { IsString, IsOptional, IsUrl, IsEnum, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HomeSlideType } from 'src/core/domain/entities/home-slide/home-slide.entity';

export class UpdateHomeSlideDto {
  @ApiPropertyOptional({
    description: 'Title of the slide',
    example: 'Welcome to INDERBU - Updated',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the slide',
    example: 'Updated description for sports facilities',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL of the slide image',
    example: 'https://example.com/new-image.jpg',
    maxLength: 500,
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Link URL when slide is clicked',
    example: 'https://example.com/new-link',
    maxLength: 500,
  })
  @IsUrl()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional({
    description: 'Display order of the slide',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the slide is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Type of slide',
    enum: HomeSlideType,
    example: HomeSlideType.BANNER,
  })
  @IsEnum(HomeSlideType)
  @IsOptional()
  slideType?: HomeSlideType;
}