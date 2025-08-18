import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, Min, IsBoolean } from 'class-validator';

export class UserPageOptionsDto {
  @ApiPropertyOptional({ 
    minimum: 1, 
    description: 'Page number for pagination',
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ 
    minimum: 1, 
    description: 'Number of items per page',
    example: 20 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  @ApiPropertyOptional({
    description: 'Search term for name, email, or DNI',
    example: 'juan'
  })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role ID',
    example: [1, 2]
  })
  @IsOptional()
  roleId?: number[];

  @ApiPropertyOptional({
    description: 'Filter by neighborhood ID',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  neighborhoodId?: number;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}