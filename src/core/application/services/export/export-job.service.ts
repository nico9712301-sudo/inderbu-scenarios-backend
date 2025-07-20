import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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
export class ExportJobService {
  private jobs = new Map<string, ExportJob>();

  createJob(format: 'xlsx' | 'csv', metadata?: Record<string, any>): ExportJob {
    const job: ExportJob = {
      id: randomUUID(),
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      format,
      metadata,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  getJob(jobId: string): ExportJob | null {
    return this.jobs.get(jobId) || null;
  }

  updateJob(jobId: string, updates: Partial<ExportJob>): ExportJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  updateProgress(jobId: string, progress: number, status?: ExportJob['status']): ExportJob | null {
    return this.updateJob(jobId, { 
      progress: Math.min(100, Math.max(0, progress)),
      ...(status && { status })
    });
  }

  markCompleted(jobId: string, fileName: string, filePath: string, fileSize?: number): ExportJob | null {
    return this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      fileName,
      filePath,
      fileSize,
    });
  }

  markFailed(jobId: string, error: string): ExportJob | null {
    return this.updateJob(jobId, {
      status: 'failed',
      error,
    });
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  getAllJobs(): ExportJob[] {
    return Array.from(this.jobs.values());
  }

  cleanupOldJobs(olderThanHours = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.updatedAt < cutoffTime) {
        this.jobs.delete(jobId);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}