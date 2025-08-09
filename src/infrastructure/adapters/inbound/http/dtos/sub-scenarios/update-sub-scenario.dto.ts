import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSubScenarioDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasCost?: boolean;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  numberOfSpectators?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  numberOfPlayers?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  recommendations?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  activityAreaId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  fieldSurfaceTypeId?: number;
}
