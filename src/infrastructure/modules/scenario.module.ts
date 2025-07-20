import { Module } from '@nestjs/common';

import { ScenarioController } from 'src/infrastructure/adapters/inbound/http/controllers/scenario.controller';
import { scenarioProviders } from '../providers/scenario/scenario.providers';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis.module';
import { ScenarioExportApplicationService } from 'src/core/application/services/scenario-export-application.service';
import { RedisExportJobService } from 'src/core/application/services/export/redis-export-job.service';
import { FileExportService } from 'src/core/application/services/export/file-export.service';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
  ],
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
