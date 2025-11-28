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

import { IScenarioApplicationPort } from '../../../../../core/application/ports/inbound/scenario-application.port';
import { ScenarioResponseDto } from '../dtos/scenario/scenario-response.dto';
import { CreateScenarioDto } from '../dtos/scenario/create-scenario.dto';
import { UpdateScenarioDto } from '../dtos/scenario/update-scenario.dto';
import { PageOptionsDto } from '../dtos/common/page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { APPLICATION_PORTS } from '../../../../../core/application/tokens/ports';
import { ScenarioResponseMapper } from '../../../../mappers/scenario/scenario-response.mapper';
import {
  ExportScenariosDto,
  ExportJobResponseDto,
  ExportDownloadResponseDto,
} from '../dtos/scenario/export-scenarios.dto';
import { ScenarioExportApplicationService } from '../../../../../core/application/services/scenario-export-application.service';
import { ExportJob } from '../../../../../core/application/services/export/redis-export-job.service';
import { ScenarioDomainEntity } from '../../../../../core/domain/entities/scenario.domain-entity';

@ApiTags('Scenarios')
@Controller('scenarios')
export class ScenarioController {
  constructor(
    @Inject(APPLICATION_PORTS.SCENARIO)
    private readonly scenarioApplicationService: IScenarioApplicationPort,
    private readonly scenarioExportService: ScenarioExportApplicationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de escenarios' })
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
    name: 'neighborhoodId',
    required: false,
    type: Number,
    description: 'Filtra por barrio',
  })
  @ApiResponse({ status: 200, type: PageDto })
  async getAll(
    @Query() opts: PageOptionsDto,
  ): Promise<PageDto<ScenarioResponseDto>> {
    return this.scenarioApplicationService.listPaged(opts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un escenario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del escenario' })
  @ApiResponse({ status: 200, type: ScenarioResponseDto })
  @ApiResponse({ status: 404, description: 'Escenario no encontrado' })
  async getById(@Param('id') id: number): Promise<ScenarioResponseDto> {
    const scenario: ScenarioDomainEntity | null =
      await this.scenarioApplicationService.getById(id);
    return ScenarioResponseMapper.toDto(scenario!);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo escenario' })
  @ApiResponse({
    status: 201,
    type: ScenarioResponseDto,
    description: 'Escenario creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Barrio no encontrado' })
  async create(
    @Body() createDto: CreateScenarioDto,
  ): Promise<ScenarioResponseDto> {
    return this.scenarioApplicationService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un escenario existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del escenario' })
  @ApiResponse({
    status: 200,
    type: ScenarioResponseDto,
    description: 'Escenario actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Escenario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScenarioDto,
  ): Promise<ScenarioResponseDto> {
    return this.scenarioApplicationService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un escenario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del escenario' })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'true si se eliminó correctamente',
  })
  @ApiResponse({ status: 404, description: 'Escenario no encontrado' })
  @ApiResponse({
    status: 400,
    description:
      'No se puede eliminar el escenario porque tiene sub-escenarios asociados',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.scenarioApplicationService.delete(id);
  }

  // ===============================
  // ENDPOINTS DE EXPORTACIÓN Y POLLING
  // ===============================

  @Post('export')
  @ApiOperation({ summary: 'Inicia exportación asíncrona de escenarios' })
  @ApiResponse({
    status: 201,
    type: ExportJobResponseDto,
    description: 'Job de exportación creado',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de exportación inválidos',
  })
  async startExport(
    @Body() exportDto: ExportScenariosDto,
  ): Promise<ExportJobResponseDto> {
    const { jobId } = await this.scenarioExportService.startExport({
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
  @ApiResponse({ status: 200, type: ExportJobResponseDto })
  @ApiResponse({ status: 404, description: 'Job no encontrado' })
  async getExportStatus(
    @Param('jobId') jobId: string,
  ): Promise<ExportJobResponseDto> {
    const job: ExportJob | null =
      await this.scenarioExportService.getExportStatus(jobId);

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
  @ApiResponse({ status: 200, type: ExportDownloadResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Job no encontrado o no completado',
  })
  async getExportDownload(
    @Param('jobId') jobId: string,
  ): Promise<ExportDownloadResponseDto> {
    const downloadInfo =
      await this.scenarioExportService.getDownloadInfo(jobId);

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
    const filePath = await this.scenarioExportService.getJobFilePath(jobId);

    if (!filePath) {
      throw new NotFoundException(
        `Archivo de exportación ${jobId} no encontrado`,
      );
    }

    const job = await this.scenarioExportService.getExportStatus(jobId);
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
