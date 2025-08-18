import { Injectable, Inject } from '@nestjs/common';
import {
  RedisExportJobService,
  ExportJob,
} from './export/redis-export-job.service';
import { FileExportService, ExportData } from './export/file-export.service';
import { IScenarioRepositoryPort } from 'src/core/domain/ports/outbound/scenario-repository.port';
import { INeighborhoodRepositoryPort } from 'src/core/domain/ports/outbound/neighborhood-repository.port';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';

export interface ExportScenariosOptions {
  format: 'xlsx' | 'csv';
  filters?: {
    active?: boolean;
    neighborhoodId?: number;
    activityAreaId?: number;
    search?: string;
  };
  includeFields?: string[];
}

@Injectable()
export class ScenarioExportApplicationService {
  constructor(
    private readonly exportJobService: RedisExportJobService,
    private readonly fileExportService: FileExportService,
    @Inject(REPOSITORY_PORTS.SCENARIO)
    private readonly scenarioRepository: IScenarioRepositoryPort,
    @Inject(REPOSITORY_PORTS.NEIGHBORHOOD)
    private readonly neighborhoodRepository: INeighborhoodRepositoryPort,
  ) {}

  async startExport(
    options: ExportScenariosOptions,
  ): Promise<{ jobId: string }> {
    // Crear job
    const job = await this.exportJobService.createJob(options.format, {
      filters: options.filters,
      includeFields: options.includeFields,
    });

    // Procesar exportación de forma asíncrona
    this.processExportAsync(job.id, options).catch(async (error) => {
      console.error(`Error processing export job ${job.id}:`, error);
      await this.exportJobService.markFailed(
        job.id,
        error.message || 'Error desconocido',
      );
    });

    return { jobId: job.id };
  }

  async getExportStatus(jobId: string): Promise<ExportJob | null> {
    return await this.exportJobService.getJob(jobId);
  }

  async getDownloadInfo(jobId: string): Promise<{
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  } | null> {
    const job = await this.exportJobService.getJob(jobId);

    if (!job || job.status !== 'completed' || !job.fileName) {
      return null;
    }

    // En un entorno de producción, esto debería ser una URL firmada de S3 o similar
    // Por ahora, usamos una URL local
    const downloadUrl = `/api/scenarios/export/${jobId}/download`;

    return {
      downloadUrl,
      fileName: job.fileName,
      fileSize: job.fileSize || 0,
    };
  }

  async getJobFilePath(jobId: string): Promise<string | null> {
    const job = await this.exportJobService.getJob(jobId);
    return job?.filePath || null;
  }

  private async processExportAsync(
    jobId: string,
    options: ExportScenariosOptions,
  ): Promise<void> {
    try {
      // Actualizar estado a "processing"
      await this.exportJobService.updateJob(jobId, { status: 'processing' });

      // Paso 1: Obtener datos (20% progreso)
      await this.exportJobService.updateProgress(jobId, 20);

      const pageOptions: PageOptionsDto = {
        page: 1,
        limit: 99999, // Obtener todos los registros
        ...options.filters,
      };

      const { data: scenarios } =
        await this.scenarioRepository.findPaged(pageOptions);

      // Paso 2: Obtener barrios relacionados (40% progreso)
      await this.exportJobService.updateProgress(jobId, 40);

      const neighborhoodIds = scenarios
        .map((s) => s.neighborhoodId)
        .filter((id): id is number => id != null && id > 0);

      const neighborhoods = new Map();
      if (neighborhoodIds.length > 0) {
        const neighList =
          await this.neighborhoodRepository.findByIds(neighborhoodIds);
        for (const neigh of neighList) {
          if (neigh.id != null) {
            neighborhoods.set(neigh.id, neigh);
          }
        }
      }

      // Paso 3: Preparar datos para exportación (60% progreso)
      await this.exportJobService.updateProgress(jobId, 60);

      const exportData: ExportData = {
        scenarios,
        neighborhoods,
        includeFields: options.includeFields,
      };

      // Paso 4: Generar archivo (80% progreso)
      await this.exportJobService.updateProgress(jobId, 80);

      let exportResult;
      if (options.format === 'xlsx') {
        exportResult = await this.fileExportService.exportToExcel(exportData);
      } else {
        exportResult = await this.fileExportService.exportToCsv(exportData);
      }

      // Paso 5: Marcar como completado (100% progreso)
      await this.exportJobService.markCompleted(
        jobId,
        exportResult.fileName,
        exportResult.filePath,
        exportResult.fileSize,
      );

      console.log(
        `Export job ${jobId} completed successfully. File: ${exportResult.fileName}`,
      );
    } catch (error) {
      console.error(`Export job ${jobId} failed:`, error);
      await this.exportJobService.markFailed(
        jobId,
        error.message || 'Error durante la exportación',
      );
    }
  }

  // Método para limpiar trabajos antiguos (se puede ejecutar como cron job)
  async cleanupOldJobs(): Promise<{
    deletedJobs: number;
    deletedFiles: number;
  }> {
    const deletedJobs = await this.exportJobService.cleanupOldJobs(24);
    const deletedFiles = this.fileExportService.cleanupOldFiles(24);

    return { deletedJobs, deletedFiles };
  }
}
