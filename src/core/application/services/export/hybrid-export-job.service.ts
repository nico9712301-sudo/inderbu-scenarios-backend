import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ExportJobService } from './export-job.service';
import { RedisExportJobService, ExportJob } from './redis-export-job.service';

@Injectable()
export class HybridExportJobService implements OnModuleInit {
  private isRedisAvailable = false;
  private redisService: RedisExportJobService;
  private memoryService: ExportJobService;

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {
    this.redisService = new RedisExportJobService(redis);
    this.memoryService = new ExportJobService();
  }

  async onModuleInit() {
    try {
      await this.redis.ping();
      this.isRedisAvailable = true;
      console.log('✅ Redis disponible - Usando persistencia Redis');
    } catch (error) {
      this.isRedisAvailable = false;
      console.log('⚠️ Redis no disponible - Usando fallback en memoria');
    }

    // Monitor Redis connection
    this.redis.on('ready', () => {
      this.isRedisAvailable = true;
      console.log('✅ Redis reconectado - Cambiando a persistencia Redis');
    });

    this.redis.on('error', () => {
      this.isRedisAvailable = false;
      console.log('⚠️ Redis desconectado - Usando fallback en memoria');
    });
  }

  async createJob(format: 'xlsx' | 'csv', metadata?: Record<string, any>): Promise<ExportJob> {
    if (this.isRedisAvailable) {
      try {
        return await this.redisService.createJob(format, metadata);
      } catch (error) {
        console.warn('Error creando job en Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
        return this.memoryService.createJob(format, metadata);
      }
    }
    return this.memoryService.createJob(format, metadata);
  }

  async getJob(jobId: string): Promise<ExportJob | null> {
    if (this.isRedisAvailable) {
      try {
        const job = await this.redisService.getJob(jobId);
        if (job) return job;
      } catch (error) {
        console.warn('Error obteniendo job de Redis, intentando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.getJob(jobId);
  }

  async updateJob(jobId: string, updates: Partial<ExportJob>): Promise<ExportJob | null> {
    if (this.isRedisAvailable) {
      try {
        const result = await this.redisService.updateJob(jobId, updates);
        if (result) return result;
      } catch (error) {
        console.warn('Error actualizando job en Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.updateJob(jobId, updates);
  }

  async updateProgress(jobId: string, progress: number, status?: ExportJob['status']): Promise<ExportJob | null> {
    if (this.isRedisAvailable) {
      try {
        const result = await this.redisService.updateProgress(jobId, progress, status);
        if (result) return result;
      } catch (error) {
        console.warn('Error actualizando progreso en Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.updateProgress(jobId, progress, status);
  }

  async markCompleted(jobId: string, fileName: string, filePath: string, fileSize?: number): Promise<ExportJob | null> {
    if (this.isRedisAvailable) {
      try {
        const result = await this.redisService.markCompleted(jobId, fileName, filePath, fileSize);
        if (result) return result;
      } catch (error) {
        console.warn('Error marcando completado en Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.markCompleted(jobId, fileName, filePath, fileSize);
  }

  async markFailed(jobId: string, error: string): Promise<ExportJob | null> {
    if (this.isRedisAvailable) {
      try {
        const result = await this.redisService.markFailed(jobId, error);
        if (result) return result;
      } catch (error) {
        console.warn('Error marcando fallido en Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.markFailed(jobId, error);
  }

  async deleteJob(jobId: string): Promise<boolean> {
    if (this.isRedisAvailable) {
      try {
        return await this.redisService.deleteJob(jobId);
      } catch (error) {
        console.warn('Error eliminando job de Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.deleteJob(jobId);
  }

  async getAllJobs(): Promise<ExportJob[]> {
    if (this.isRedisAvailable) {
      try {
        return await this.redisService.getAllJobs();
      } catch (error) {
        console.warn('Error obteniendo jobs de Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.getAllJobs();
  }

  async cleanupOldJobs(olderThanHours = 24): Promise<number> {
    if (this.isRedisAvailable) {
      try {
        return await this.redisService.cleanupOldJobs(olderThanHours);
      } catch (error) {
        console.warn('Error limpiando jobs de Redis, usando memoria:', error.message);
        this.isRedisAvailable = false;
      }
    }
    return this.memoryService.cleanupOldJobs(olderThanHours);
  }

  // Método para verificar qué backend se está usando
  getActiveBackend(): 'redis' | 'memory' {
    return this.isRedisAvailable ? 'redis' : 'memory';
  }

  // Método para obtener estadísticas del servicio
  async getServiceStats(): Promise<{ backend: string; jobCount: number }> {
    const jobs = await this.getAllJobs();
    return {
      backend: this.getActiveBackend(),
      jobCount: jobs.length,
    };
  }
}