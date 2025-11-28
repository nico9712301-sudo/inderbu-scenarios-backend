import { Module } from '@nestjs/common';

import { ScenarioController } from '../adapters/inbound/http/controllers/scenario.controller';
import { scenarioProviders } from '../providers/scenario/scenario.providers';
import { APPLICATION_PORTS } from '../../core/application/tokens/ports';
import { REPOSITORY_PORTS } from '../tokens/ports';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis.module';
import { ScenarioExportApplicationService } from '../../core/application/services/scenario-export-application.service';
import { RedisExportJobService } from '../../core/application/services/export/redis-export-job.service';
import { FileExportService } from '../../core/application/services/export/file-export.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [ScenarioController],
  providers: [
    ...scenarioProviders,
    ScenarioExportApplicationService,
    RedisExportJobService,
    FileExportService,
  ],
  exports: [
    APPLICATION_PORTS.SCENARIO,
    REPOSITORY_PORTS.SCENARIO,
    ScenarioExportApplicationService,
  ],
})
export class ScenarioModule {}
