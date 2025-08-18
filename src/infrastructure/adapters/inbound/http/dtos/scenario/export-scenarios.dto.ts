import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExportFormat {
  XLSX = 'xlsx',
  CSV = 'csv',
}

export class ExportScenariosFiltersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  neighborhoodId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  activityAreaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class ExportScenariosDto {
  @ApiProperty({ enum: ExportFormat, default: ExportFormat.XLSX })
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.XLSX;

  @ApiPropertyOptional({ type: ExportScenariosFiltersDto })
  @IsOptional()
  @Type(() => ExportScenariosFiltersDto)
  filters?: ExportScenariosFiltersDto;

  @ApiPropertyOptional({
    type: [String],
    description: 'Campos a incluir en la exportación',
    example: [
      'id',
      'name',
      'address',
      'active',
      'neighborhood.name',
      'createdAt',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeFields?: string[];
}

export class ExportJobResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiPropertyOptional()
  progress?: number;

  @ApiPropertyOptional()
  message?: string;
}

export class ExportDownloadResponseDto {
  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  fileName: string;

  @ApiPropertyOptional()
  fileSize?: number;
}
