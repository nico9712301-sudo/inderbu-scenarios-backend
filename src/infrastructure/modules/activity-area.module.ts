import { Module } from '@nestjs/common';
import { ActivityAreaController } from '../adapters/inbound/http/controllers/activity-area.controller';
import { DatabaseModule } from './database/database.module';
import { activityAreaProviders } from '../providers/activity-area/activity-area.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...activityAreaProviders],
  controllers: [ActivityAreaController],
})
export class ActivityAreaModule {}
