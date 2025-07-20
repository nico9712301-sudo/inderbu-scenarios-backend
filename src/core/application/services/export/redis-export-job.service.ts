import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Redis } from 'ioredis';

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  format: 'xlsx' | 'csv';
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  error?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class RedisExportJobService {
  private readonly keyPrefix = 'export_job:';
  private readonly ttl = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async createJob(format: 'xlsx' | 'csv', metadata?: Record<string, any>): Promise<ExportJob> {
    const job: ExportJob = {
      id: randomUUID(),
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      format,
      metadata,
    };

    await this.saveJob(job);
    return job;
  }

  async getJob(jobId: string): Promise<ExportJob | null> {
    try {
      const data = await this.redis.get(this.getKey(jobId));
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
    } catch (error) {
      console.error(`Error getting job ${jobId}:`, error);
      return null;
    }
  }

  async updateJob(jobId: string, updates: Partial<ExportJob>): Promise<ExportJob | null> {
    const job = await this.getJob(jobId);
    if (!job) return null;

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveJob(updatedJob);
    return updatedJob;
  }

  async updateProgress(jobId: string, progress: number, status?: ExportJob['status']): Promise<ExportJob | null> {
    return this.updateJob(jobId, { 
      progress: Math.min(100, Math.max(0, progress)),
      ...(status && { status })
    });
  }

  async markCompleted(jobId: string, fileName: string, filePath: string, fileSize?: number): Promise<ExportJob | null> {
    return this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      fileName,
      filePath,
      fileSize,
    });
  }

  async markFailed(jobId: string, error: string): Promise<ExportJob | null> {
    return this.updateJob(jobId, {
      status: 'failed',
      error,
    });
  }

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const result = await this.redis.del(this.getKey(jobId));
      return result > 0;
    } catch (error) {
      console.error(`Error deleting job ${jobId}:`, error);
      return false;
    }
  }

  async getAllJobs(): Promise<ExportJob[]> {
    try {
      const keys = await this.redis.keys(this.keyPrefix + '*');
      if (keys.length === 0) return [];

      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.get(key));
      const results = await pipeline.exec();

      const jobs: ExportJob[] = [];
      for (const result of results || []) {
        if (result && result[1]) {
          try {
            const parsed = JSON.parse(result[1] as string);
            jobs.push({
              ...parsed,
              createdAt: new Date(parsed.createdAt),
              updatedAt: new Date(parsed.updatedAt),
            });
          } catch (error) {
            console.error('Error parsing job:', error);
          }
        }
      }

      return jobs;
    } catch (error) {
      console.error('Error getting all jobs:', error);
      return [];
    }
  }

  async cleanupOldJobs(olderThanHours = 24): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
      const jobs = await this.getAllJobs();
      
      let deletedCount = 0;
      const pipeline = this.redis.pipeline();

      for (const job of jobs) {
        if (job.updatedAt < cutoffTime) {
          pipeline.del(this.getKey(job.id));
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        await pipeline.exec();
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old jobs:', error);
      return 0;
    }
  }

  private async saveJob(job: ExportJob): Promise<void> {
    try {
      await this.redis.setex(
        this.getKey(job.id),
        this.ttl,
        JSON.stringify(job)
      );
    } catch (error) {
      console.error(`Error saving job ${job.id}:`, error);
      throw error;
    }
  }

  private getKey(jobId: string): string {
    return this.keyPrefix + jobId;
  }

  // Método adicional para extender TTL cuando un job está siendo procesado
  async extendJobTtl(jobId: string, additionalHours = 24): Promise<void> {
    try {
      await this.redis.expire(this.getKey(jobId), additionalHours * 60 * 60);
    } catch (error) {
      console.error(`Error extending TTL for job ${jobId}:`, error);
    }
  }

  // Método para obtener estadísticas de jobs
  async getJobStats(): Promise<{ total: number; byStatus: Record<string, number> }> {
    const jobs = await this.getAllJobs();
    const stats = {
      total: jobs.length,
      byStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      }
    };

    for (const job of jobs) {
      stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
    }

    return stats;
  }
}