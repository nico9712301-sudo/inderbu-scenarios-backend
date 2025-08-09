import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Inject, 
  NotFoundException, 
  Param, 
  Query,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiParam, 
  ApiQuery, 
  ApiResponse,
  ApiConsumes,
  ApiTags, 
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ISubScenarioApplicationPort } from 'src/core/application/ports/inbound/sub-scenario-application.port';
import { SubScenarioWithRelationsDto } from '../dtos/sub-scenarios/sub-scenario-response-with-relations.dto';
import { SubScenarioPageOptionsDto } from '../dtos/sub-scenarios/sub-scenario-page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { CreateSubScenarioDto } from '../dtos/sub-scenarios/create-sub-scenario.dto';
import { UpdateSubScenarioDto } from '../dtos/sub-scenarios/update-sub-scenario.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

@ApiTags('Sub-escenarios')
@Controller('sub-scenarios')
export class SubScenarioController {
  constructor(
    @Inject(APPLICATION_PORTS.SUB_SCENARIO)
    private readonly subScenarioApplicationService: ISubScenarioApplicationPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de sub‑escenarios' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (1‑based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto libre sobre name' })
  @ApiQuery({ name: 'scenarioId', required: false, type: Number, description: 'Filtra por escenario' })
  @ApiQuery({ name: 'activityAreaId', required: false, type: Number, description: 'Filtra por área de actividad' })
  @ApiQuery({ name: 'neighborhoodId', required: false, type: Number, description: 'Filtra por barrio (id)' })
  @ApiQuery({ name: 'hasCost', required: false, type: Boolean, description: 'Filtrar por costo: true=pagos, false=gratuitos' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filtrar por estado activo: true=activos, false=inactivos' })
  @ApiResponse({ status: 200, type: PageDto })
  async getSubScenarios(
    @Query() opts: SubScenarioPageOptionsDto,
  ): Promise<PageDto<SubScenarioWithRelationsDto>> {
    console.log("hi");
    
    return this.subScenarioApplicationService.listWithRelations(opts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un sub-escenario por ID con relaciones' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del sub-escenario' })
  @ApiResponse({ status: 200, type: SubScenarioWithRelationsDto })
  @ApiResponse({ status: 404, description: 'Sub-escenario no encontrado' })
  async getSubScenarioById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubScenarioWithRelationsDto> {
    return this.subScenarioApplicationService.getByIdWithRelations(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo sub-escenario' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: SubScenarioWithRelationsDto })
  @UseInterceptors(FilesInterceptor('images'))
  async createSubScenario(
    @Body() createDto: CreateSubScenarioDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<SubScenarioWithRelationsDto> {
    return this.subScenarioApplicationService.create(createDto, images);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un sub-escenario existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del sub-escenario' })
  @ApiResponse({ status: 200, type: SubScenarioWithRelationsDto })
  @ApiResponse({ status: 404, description: 'Sub-escenario no encontrado' })
  async updateSubScenario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubScenarioDto,
  ): Promise<SubScenarioWithRelationsDto> {
    return this.subScenarioApplicationService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un sub-escenario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del sub-escenario' })
  @ApiResponse({ status: 200, type: Boolean, description: 'true si se eliminó correctamente' })
  @ApiResponse({ status: 404, description: 'Sub-escenario no encontrado' })
  async deleteSubScenario(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.subScenarioApplicationService.delete(id);
  }
}
