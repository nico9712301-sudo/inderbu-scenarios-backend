import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, Min, IsBoolean } from 'class-validator';

export class SubScenarioPageOptionsDto {
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

  // FILTRO ESPECÍFICO PARA SUB-SCENARIOS
  @ApiPropertyOptional({
    description: 'Filtrar por costo: true=pagos, false=gratuitos',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasCost?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo: true=activos, false=inactivos',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;
}
