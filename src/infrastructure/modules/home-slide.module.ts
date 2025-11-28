import { Module } from '@nestjs/common';

import { HomeSlideController } from '../adapters/inbound/http/controllers/home-slide.controller';
import {
  ModulesController,
  EntitiesController,
} from '../adapters/inbound/http/controllers/modules.controller';
import { homeSlideProviders } from '../providers/home-slide/home-slide.providers';
import { APPLICATION_PORTS } from '../../core/application/tokens/ports';
import { REPOSITORY_PORTS } from '../tokens/ports';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HomeSlideController, ModulesController, EntitiesController],
  providers: [...homeSlideProviders],
  exports: [APPLICATION_PORTS.HOME_SLIDE, REPOSITORY_PORTS.HOME_SLIDE],
})
export class HomeSlideModule {}
