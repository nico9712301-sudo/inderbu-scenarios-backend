import { Module } from '@nestjs/common';

import { CommuneController } from '../../adapters/inbound/http/controllers/commune.controller';
import { communeProviders } from '../../providers/commune/commune.providers';
import { DatabaseModule } from '../database/database.module';
import { CityModule } from './city.module';

@Module({
  imports: [
    DatabaseModule,
    CityModule, // Import CityModule para acceder a ICityRepositoryPort
  ],
  providers: [...communeProviders],
  controllers: [CommuneController],
  exports: [...communeProviders], // Export para que otros módulos puedan usar
})
export class CommuneModule {}
