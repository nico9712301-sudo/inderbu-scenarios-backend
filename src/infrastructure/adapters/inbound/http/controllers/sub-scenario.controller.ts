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
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';

import { ISubScenarioApplicationPort } from 'src/core/application/ports/inbound/sub-scenario-application.port';
import { SubScenarioWithRelationsDto } from '../dtos/sub-scenarios/sub-scenario-response-with-relations.dto';
import { SubScenarioPageOptionsDto } from '../dtos/sub-scenarios/sub-scenario-page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { CreateSubScenarioDto } from '../dtos/sub-scenarios/create-sub-scenario.dto';
import { UpdateSubScenarioDto } from '../dtos/sub-scenarios/update-sub-scenario.dto';
import {
  ExportSubScenariosDto,
  SubScenarioExportJobResponseDto,
  SubScenarioExportDownloadResponseDto,
} from '../dtos/sub-scenarios/export-sub-scenarios.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { SubScenarioExportApplicationService } from 'src/core/application/services/sub-scenario-export-application.service';
import { ExportJob } from 'src/core/application/services/export/redis-export-job.service';

@ApiTags('Sub-escenarios')
@Controller('sub-scenarios')
export class SubScenarioController {
  constructor(
    @Inject(APPLICATION_PORTS.SUB_SCENARIO)
    private readonly subScenarioApplicationService: ISubScenarioApplicationPort,
    private readonly subScenarioExportService: SubScenarioExportApplicationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de sub‑escenarios' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (1‑based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Tamaño de página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Texto libre sobre name',
  })
  @ApiQuery({
    name: 'scenarioId',
    required: false,
    type: Number,
    description: 'Filtra por escenario',
  })
  @ApiQuery({
    name: 'activityAreaId',
    required: false,
    type: Number,
    description: 'Filtra por área de actividad',
  })
  @ApiQuery({
    name: 'neighborhoodId',
    required: false,
    type: Number,
    description: 'Filtra por barrio (id)',
  })
  @ApiQuery({
    name: 'hasCost',
    required: false,
    type: Boolean,
    description: 'Filtrar por costo: true=pagos, false=gratuitos',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo: true=activos, false=inactivos',
  })
  @ApiResponse({ status: 200, type: PageDto })
  async getSubScenarios(
    @Query() opts: SubScenarioPageOptionsDto,
  ): Promise<PageDto<SubScenarioWithRelationsDto>> {
    console.log('hi');

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
  @ApiResponse({ status: 201, type: SubScenarioWithRelationsDto })
  async createSubScenario(
    @Body() createDto: CreateSubScenarioDto,
  ): Promise<SubScenarioWithRelationsDto> {
    return this.subScenarioApplicationService.create(createDto);
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
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'true si se eliminó correctamente',
  })
  @ApiResponse({ status: 404, description: 'Sub-escenario no encontrado' })
  async deleteSubScenario(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.subScenarioApplicationService.delete(id);
  }

  // ===============================
  // ENDPOINTS DE EXPORTACIÓN Y POLLING
  // ===============================

  @Post('export')
  @ApiOperation({ summary: 'Inicia exportación asíncrona de sub-escenarios' })
  @ApiResponse({
    status: 201,
    type: SubScenarioExportJobResponseDto,
    description: 'Job de exportación creado',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de exportación inválidos',
  })
  async startExport(
    @Body() exportDto: ExportSubScenariosDto,
  ): Promise<SubScenarioExportJobResponseDto> {
    const { jobId } = await this.subScenarioExportService.startExport({
      format: exportDto.format,
      filters: exportDto.filters,
      includeFields: exportDto.includeFields,
    });

    return {
      jobId,
      status: 'pending',
      message: 'Exportación iniciada correctamente',
    };
  }

  @Get('export/:jobId/status')
  @ApiOperation({ summary: 'Consulta el estado de un job de exportación' })
  @ApiParam({
    name: 'jobId',
    type: String,
    description: 'ID del job de exportación',
  })
  @ApiResponse({ status: 200, type: SubScenarioExportJobResponseDto })
  @ApiResponse({ status: 404, description: 'Job no encontrado' })
  async getExportStatus(
    @Param('jobId') jobId: string,
  ): Promise<SubScenarioExportJobResponseDto> {
    const job: ExportJob | null =
      await this.subScenarioExportService.getExportStatus(jobId);

    if (!job) {
      throw new NotFoundException(`Job de exportación ${jobId} no encontrado`);
    }

    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      message: job.error || this.getStatusMessage(job.status),
    };
  }

  @Get('export/:jobId/download')
  @ApiOperation({
    summary: 'Obtiene información de descarga para un job completado',
  })
  @ApiParam({
    name: 'jobId',
    type: String,
    description: 'ID del job de exportación',
  })
  @ApiResponse({ status: 200, type: SubScenarioExportDownloadResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Job no encontrado o no completado',
  })
  async getExportDownload(
    @Param('jobId') jobId: string,
  ): Promise<SubScenarioExportDownloadResponseDto> {
    const downloadInfo =
      await this.subScenarioExportService.getDownloadInfo(jobId);

    if (!downloadInfo) {
      throw new NotFoundException(
        `Archivo de exportación ${jobId} no disponible`,
      );
    }

    return downloadInfo;
  }

  @Get('export/:jobId/file')
  @ApiOperation({ summary: 'Descarga directa del archivo exportado' })
  @ApiParam({
    name: 'jobId',
    type: String,
    description: 'ID del job de exportación',
  })
  @ApiResponse({ status: 200, description: 'Archivo descargado exitosamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async downloadExportFile(
    @Param('jobId') jobId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = await this.subScenarioExportService.getJobFilePath(jobId);

    if (!filePath) {
      throw new NotFoundException(
        `Archivo de exportación ${jobId} no encontrado`,
      );
    }

    const job = await this.subScenarioExportService.getExportStatus(jobId);
    if (!job || job.status !== 'completed' || !job.fileName) {
      throw new NotFoundException(
        `Exportación ${jobId} no completada o archivo no disponible`,
      );
    }

    // Configurar headers para descarga
    const mimeType =
      job.format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${job.fileName}"`,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  private getStatusMessage(status: string): string {
    switch (status) {
      case 'pending':
        return 'Exportación en cola';
      case 'processing':
        return 'Procesando exportación...';
      case 'completed':
        return 'Exportación completada';
      case 'failed':
        return 'Error en la exportación';
      default:
        return 'Estado desconocido';
    }
  }
}
