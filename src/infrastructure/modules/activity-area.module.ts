import { Module } from '@nestjs/common';
import { ActivityAreaEntity } from '../persistence/activity-area.entity';
import { ActivityAreaRepositoryAdapter } from '../adapters/outbound/repositories/activity-area-repository.adapter';
import { ActivityAreaApplicationService } from 'src/core/application/services/activity-area-application.service';
import { ActivityAreaController } from '../adapters/inbound/http/controllers/activity-area.controller';
import { DatabaseModule } from './database/database.module';
import { activityAreaProviders } from '../providers/activity-area/activity-area.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...activityAreaProviders],
  controllers: [ActivityAreaController],
})
export class ActivityAreaModule {}
