import { Controller, Get, Post, Put, Delete, Inject, Query, Body, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

import { ActivityAreaResponseMapper } from 'src/infrastructure/mappers/activity-area/activity-area-response.mapper';
import { IActivityAreaApplicationPort } from 'src/core/application/ports/inbound/activity-area-application.port';
import { ActivityAreaResponseDto } from '../dtos/activity-area/activity-area-response.dto';
import { CreateActivityAreaDto } from '../dtos/activity-area/create-activity-area.dto';
import { UpdateActivityAreaDto } from '../dtos/activity-area/update-activity-area.dto';
import { PageOptionsDto } from '../dtos/common/page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

@ApiTags('Activity Areas')
@Controller('activity-areas')
export class ActivityAreaController {
  constructor(
    @Inject(APPLICATION_PORTS.ACTIVITY_AREA)
    private readonly service: IActivityAreaApplicationPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista de áreas de actividad' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto libre sobre name' })
  @ApiResponse({ status: 200, type: [ActivityAreaResponseDto], description: 'Retorna lista completa sin paginación si no se especifican parámetros' })
  @ApiResponse({ status: 200, type: PageDto, description: 'Retorna resultado paginado cuando se especifica page o limit' })
  async list(@Query() opts: PageOptionsDto): Promise<ActivityAreaResponseDto[] | PageDto<ActivityAreaResponseDto>> {
    // Si no se especifica página o límite, retornar lista completa sin paginar
    if (!opts.page && !opts.limit && !opts.search) {
      const list = await this.service.listAll();
      return list.map(ActivityAreaResponseMapper.toDto);
    }
    
    // Si hay parámetros de paginación o búsqueda, usar listPaged
    return this.service.listPaged(opts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un área de actividad por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del área de actividad' })
  @ApiResponse({ status: 200, type: ActivityAreaResponseDto })
  @ApiResponse({ status: 404, description: 'Área de actividad no encontrada' })
  async getActivityAreaById(@Param('id', ParseIntPipe) id: number): Promise<ActivityAreaResponseDto> {
    const activityArea = await this.service.getById(id);
    if (!activityArea) {
      throw new NotFoundException(`Área de actividad con ID ${id} no encontrada`);
    }
    return ActivityAreaResponseMapper.toDto(activityArea);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una nueva área de actividad' })
  @ApiResponse({ status: 201, type: ActivityAreaResponseDto, description: 'Área de actividad creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createActivityArea(@Body() createDto: CreateActivityAreaDto): Promise<ActivityAreaResponseDto> {
    return this.service.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un área de actividad existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del área de actividad' })
  @ApiResponse({ status: 200, type: ActivityAreaResponseDto, description: 'Área de actividad actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Área de actividad no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async updateActivityArea(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateActivityAreaDto,
  ): Promise<ActivityAreaResponseDto> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un área de actividad' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del área de actividad' })
  @ApiResponse({ status: 200, type: Boolean, description: 'true si se eliminó correctamente' })
  @ApiResponse({ status: 404, description: 'Área de actividad no encontrada' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el área porque tiene sub-escenarios asociados' })
  async deleteActivityArea(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    const success = await this.service.delete(id);
    return {
      success,
      message: success ? 'Área de actividad eliminada exitosamente' : 'No se pudo eliminar el área de actividad'
    };
  }
}
