import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportSubScenariosFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado activo' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por ID de escenario' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scenarioId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de área de actividad' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  activityAreaId?: number;

  @ApiPropertyOptional({ description: 'Búsqueda por texto libre en nombre' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ExportSubScenariosDto {
  @ApiProperty({ 
    enum: ['xlsx', 'csv'], 
    description: 'Formato de exportación',
    example: 'xlsx'
  })
  @IsEnum(['xlsx', 'csv'])
  format: 'xlsx' | 'csv';

  @ApiPropertyOptional({ 
    description: 'Filtros para la exportación',
    type: ExportSubScenariosFiltersDto
  })
  @IsOptional()
  @Type(() => ExportSubScenariosFiltersDto)
  filters?: ExportSubScenariosFiltersDto;

  @ApiPropertyOptional({ 
    description: 'Campos a incluir en la exportación',
    example: ['id', 'name', 'description', 'active', 'scenario.name', 'activityArea.name'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeFields?: string[];
}

export class SubScenarioExportJobResponseDto {
  @ApiProperty({ description: 'ID del job de exportación de sub-escenarios' })
  jobId: string;

  @ApiProperty({ 
    enum: ['pending', 'processing', 'completed', 'failed'],
    description: 'Estado del job de exportación de sub-escenarios'
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiPropertyOptional({ description: 'Progreso del job (0-100)' })
  progress?: number;

  @ApiProperty({ description: 'Mensaje descriptivo del estado' })
  message: string;
}

export class SubScenarioExportDownloadResponseDto {
  @ApiProperty({ description: 'URL de descarga del archivo de sub-escenarios' })
  downloadUrl: string;

  @ApiProperty({ description: 'Nombre del archivo' })
  fileName: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes' })
  fileSize: number;
}