import { diskStorage } from 'multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { Module } from '@nestjs/common';
import { join } from 'path';

import { SubScenarioImageController } from '../adapters/inbound/http/controllers/sub-scenario-image.controller';
import { subScenarioImageProviders } from '../providers/sub-scenario-image/sub-scenario-image.providers';
import { SubScenarioController } from '../adapters/inbound/http/controllers/sub-scenario.controller';
import { FileStorageService } from '../adapters/outbound/file-storage/file-storage.service';
import { CloudflareR2Service } from '../adapters/outbound/file-storage/cloudflare-r2.service';
import { ImageUrlService } from '../adapters/outbound/file-storage/image-url.service';
import { SubScenarioImageResponseMapper } from '../mappers/images/image-response.mapper';
import { SubScenarioMapper } from '../mappers/sub-scenario/sub-scenario.mapper';
import { subScenarioProviders } from '../providers/sub-scenario/sub-scenario.providers';
import { DatabaseModule } from './database/database.module';
import { SubScenarioExportApplicationService } from '../../core/application/services/sub-scenario-export-application.service';
import { SubScenarioFileExportService } from '../../core/application/services/export/sub-scenario-file-export.service';
import { RedisExportJobService } from '../../core/application/services/export/redis-export-job.service';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    MulterModule.register({
      dest: './temp', // Archivos temporales en carpeta separada
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          // Generar nombre único para archivo temporal
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop() || 'tmp';
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 10, // Máximo 10 archivos
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [SubScenarioController, SubScenarioImageController],
  providers: [
    ...subScenarioProviders,
    ...subScenarioImageProviders,
    FileStorageService,
    CloudflareR2Service,
    ImageUrlService,
    SubScenarioImageResponseMapper,
    SubScenarioMapper,
    SubScenarioExportApplicationService,
    SubScenarioFileExportService,
    RedisExportJobService,
  ],
  exports: [...subScenarioProviders],
})
export class SubScenarioModule {}
