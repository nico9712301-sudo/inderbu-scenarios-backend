import { Injectable, Inject } from '@nestjs/common';
import { RedisExportJobService, ExportJob } from './export/redis-export-job.service';
import { SubScenarioFileExportService, SubScenarioExportData } from './export/sub-scenario-file-export.service';
import { ISubScenarioRepositoryPort } from 'src/core/domain/ports/outbound/sub-scenario-repository.port';
import { IScenarioRepositoryPort } from 'src/core/domain/ports/outbound/scenario-repository.port';
import { IActivityAreaRepositoryPort } from 'src/core/domain/ports/outbound/activity-area-repository.port';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { SubScenarioPageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/sub-scenarios/sub-scenario-page-options.dto';

export interface ExportSubScenariosOptions {
  format: 'xlsx' | 'csv';
  filters?: {
    active?: boolean;
    scenarioId?: number;
    activityAreaId?: number;
    search?: string;
  };
  includeFields?: string[];
}

@Injectable()
export class SubScenarioExportApplicationService {
  constructor(
    private readonly exportJobService: RedisExportJobService,
    private readonly fileExportService: SubScenarioFileExportService,
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO)
    private readonly subScenarioRepository: ISubScenarioRepositoryPort,
    @Inject(REPOSITORY_PORTS.SCENARIO)
    private readonly scenarioRepository: IScenarioRepositoryPort,
    @Inject(REPOSITORY_PORTS.ACTIVITY_AREA)
    private readonly activityAreaRepository: IActivityAreaRepositoryPort,
  ) {}

  async startExport(options: ExportSubScenariosOptions): Promise<{ jobId: string }> {
    // Crear job
    const job = await this.exportJobService.createJob(options.format, {
      filters: options.filters,
      includeFields: options.includeFields,
    });

    // Procesar exportación de forma asíncrona
    this.processExportAsync(job.id, options).catch(async (error) => {
      console.error(`Error processing sub-scenario export job ${job.id}:`, error);
      await this.exportJobService.markFailed(job.id, error.message || 'Error desconocido');
    });

    return { jobId: job.id };
  }

  async getExportStatus(jobId: string): Promise<ExportJob | null> {
    return await this.exportJobService.getJob(jobId);
  }

  async getDownloadInfo(jobId: string): Promise<{ downloadUrl: string; fileName: string; fileSize: number } | null> {
    const job = await this.exportJobService.getJob(jobId);
    
    if (!job || job.status !== 'completed' || !job.fileName) {
      return null;
    }

    // En un entorno de producción, esto debería ser una URL firmada de S3 o similar
    // Por ahora, usamos una URL local
    const downloadUrl = `/api/sub-scenarios/export/${jobId}/download`;
    
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

  private async processExportAsync(jobId: string, options: ExportSubScenariosOptions): Promise<void> {
    try {
      // Actualizar estado a "processing"
      await this.exportJobService.updateJob(jobId, { status: 'processing' });

      // Paso 1: Obtener datos (20% progreso)
      await this.exportJobService.updateProgress(jobId, 20);
      
      const pageOptions: SubScenarioPageOptionsDto = {
        page: 1,
        limit: 99999, // Obtener todos los registros
        ...options.filters,
      };

      const { data: subScenarios } = await this.subScenarioRepository.findPaged(pageOptions);

      // Paso 2: Obtener escenarios relacionados (40% progreso)
      await this.exportJobService.updateProgress(jobId, 40);
      
      const scenarioIds = subScenarios
        .map((s) => s.scenarioId)
        .filter((id): id is number => id != null && id > 0);

      const scenarios = new Map();
      if (scenarioIds.length > 0) {
        const scenarioList = await this.scenarioRepository.findByIds(scenarioIds);
        for (const scenario of scenarioList) {
          if (scenario.id != null) {
            scenarios.set(scenario.id, scenario);
          }
        }
      }

      // Paso 3: Obtener áreas de actividad relacionadas (60% progreso)
      await this.exportJobService.updateProgress(jobId, 60);
      
      const activityAreaIds = subScenarios
        .map((s) => s.activityAreaId)
        .filter((id): id is number => id != null && id > 0);

      const activityAreas = new Map();
      if (activityAreaIds.length > 0) {
        const activityAreaList = await this.activityAreaRepository.findByIds(activityAreaIds);
        for (const area of activityAreaList) {
          if (area.id != null) {
            activityAreas.set(area.id, area);
          }
        }
      }

      // Paso 4: Preparar datos para exportación (80% progreso)
      await this.exportJobService.updateProgress(jobId, 80);

      const exportData: SubScenarioExportData = {
        subScenarios,
        scenarios,
        activityAreas,
        includeFields: options.includeFields,
      };

      // Paso 5: Generar archivo (90% progreso)
      await this.exportJobService.updateProgress(jobId, 90);

      let exportResult;
      if (options.format === 'xlsx') {
        exportResult = await this.fileExportService.exportToExcel(exportData);
      } else {
        exportResult = await this.fileExportService.exportToCsv(exportData);
      }

      // Paso 6: Marcar como completado (100% progreso)
      await this.exportJobService.markCompleted(
        jobId,
        exportResult.fileName,
        exportResult.filePath,
        exportResult.fileSize
      );

      console.log(`Sub-scenario export job ${jobId} completed successfully. File: ${exportResult.fileName}`);

    } catch (error) {
      console.error(`Sub-scenario export job ${jobId} failed:`, error);
      await this.exportJobService.markFailed(jobId, error.message || 'Error durante la exportación');
    }
  }

  // Método para limpiar trabajos antiguos (se puede ejecutar como cron job)
  async cleanupOldJobs(): Promise<{ deletedJobs: number; deletedFiles: number }> {
    const deletedJobs = await this.exportJobService.cleanupOldJobs(24);
    const deletedFiles = this.fileExportService.cleanupOldFiles(24);
    
    return { deletedJobs, deletedFiles };
  }
}