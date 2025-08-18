import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSubScenarioDto {
  @ApiProperty({ default: 'SubScenario Example' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  active?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  hasCost?: boolean;

  @ApiProperty({ required: false, default: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  numberOfSpectators?: number;

  @ApiProperty({ required: false, default: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  numberOfPlayers?: number;

  @ApiProperty({
    required: false,
    default: 'Recommendations for the sub-scenario',
  })
  @IsString()
  @IsOptional()
  recommendations?: string;

  @ApiProperty({ required: true, default: 1 })
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  scenarioId: number;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  activityAreaId?: number;

  @ApiProperty({ required: false, default: 8 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  fieldSurfaceTypeId?: number;
}
