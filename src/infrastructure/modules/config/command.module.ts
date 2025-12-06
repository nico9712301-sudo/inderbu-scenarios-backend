import { CommandModule } from 'nestjs-command';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SeedingModule } from './seeding.module';
import { AppCommandService } from '../../../core/application/services/app-command.service';
import { MigrateImagesToR2Command } from '../../cli/commands/migrate-images-r2.command';
import { CloudflareR2Service } from '../../adapters/outbound/file-storage/cloudflare-r2.service';
import { ImageUrlService } from '../../adapters/outbound/file-storage/image-url.service';
import { repositoryEntitiesProviders as subScenarioImageRepositoryProviders } from '../../providers/sub-scenario-image/repository-entities.providers';
import { repositoryEntitiesProviders as homeSlideRepositoryProviders } from '../../providers/home-slide/repository-entities.providers';

@Module({
  imports: [
    CommandModule,
    DatabaseModule, // Añade esto para tener acceso a DATA_SOURCE.MYSQL
    SeedingModule, // Añade esto para tener acceso a SeedingService
  ],
  providers: [
    AppCommandService,
    MigrateImagesToR2Command,
    CloudflareR2Service,
    ImageUrlService,
    ...subScenarioImageRepositoryProviders,
    ...homeSlideRepositoryProviders,
  ],
  exports: [AppCommandService], // Exporta el servicio para usarlo en AppModule
})
export class AppCommandModule {}
