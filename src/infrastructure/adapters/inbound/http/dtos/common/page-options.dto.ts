import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PageOptionsDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) scenarioId?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  activityAreaId?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  neighborhoodId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) userId?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  active?: boolean;
}
