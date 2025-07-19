import { Controller, Get, Post, Put, Delete, Inject, NotFoundException, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IScenarioApplicationPort } from 'src/core/application/ports/inbound/scenario-application.port';
import { ScenarioResponseDto } from '../dtos/scenario/scenario-response.dto';
import { CreateScenarioDto } from '../dtos/scenario/create-scenario.dto';
import { UpdateScenarioDto } from '../dtos/scenario/update-scenario.dto';
import { PageOptionsDto } from '../dtos/common/page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { ScenarioResponseMapper } from 'src/infrastructure/mappers/scenario/scenario-response.mapper';

@ApiTags('Scenarios')
@Controller('scenarios')
export class ScenarioController {
  constructor(
    @Inject(APPLICATION_PORTS.SCENARIO)
    private readonly scenarioApplicationService: IScenarioApplicationPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de escenarios' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (1‑based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto libre sobre name' })
  @ApiQuery({ name: 'neighborhoodId', required: false, type: Number, description: 'Filtra por barrio' })
  @ApiResponse({ status: 200, type: PageDto })
  async getAll(
    @Query() opts: PageOptionsDto,
  ): Promise<PageDto<ScenarioResponseDto>> {
    console.log('Active filter from controller:', opts.active);
    return this.scenarioApplicationService.listPaged(opts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un escenario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del escenario' })
  @ApiResponse({ status: 200, type: ScenarioResponseDto })
  @ApiResponse({ status: 404, description: 'Escenario no encontrado' })
  async getById(@Param('id') id: number): Promise<ScenarioResponseDto> {
    const scenario = await this.scenarioApplicationService.getById(id);
    if (!scenario) throw new NotFoundException(`Escenario ${id} no encontrado`);
    return ScenarioResponseMapper.toDto(scenario);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo escenario' })
  @ApiResponse({ status: 201, type: ScenarioResponseDto, description: 'Escenario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Barrio no encontrado' })
  async create(@Body() createDto: CreateScenarioDto): Promise<ScenarioResponseDto> {
    return this.scenarioApplicationService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un escenario existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del escenario' })
  @ApiResponse({ status: 200, type: ScenarioResponseDto, description: 'Escenario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Escenario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScenarioDto,
  ): Promise<ScenarioResponseDto> {
    console.log('Controller received updateDto:', updateDto);
    console.log('updateDto.neighborhoodId:', updateDto.neighborhoodId, typeof updateDto.neighborhoodId);
    return this.scenarioApplicationService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un escenario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del escenario' })
  @ApiResponse({ status: 200, type: Boolean, description: 'true si se eliminó correctamente' })
  @ApiResponse({ status: 404, description: 'Escenario no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el escenario porque tiene sub-escenarios asociados' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    const success = await this.scenarioApplicationService.delete(id);
    return {
      success,
      message: success ? 'Escenario eliminado exitosamente' : 'No se pudo eliminar el escenario'
    };
  }
}
