import { Module } from '@nestjs/common';

import { NeighborhoodController } from 'src/infrastructure/adapters/inbound/http/controllers/neighborhood.controller';
import { neighborhoodProviders } from 'src/infrastructure/providers/neighborhood/neighborhood.providers';
import { DatabaseModule } from '../database/database.module';
import { CommuneModule } from './commune.module'; // Import CommuneModule en lugar de providers directos

@Module({
  imports: [
    DatabaseModule,
    CommuneModule, // Import CommuneModule para acceder a ICommuneRepositoryPort
  ],
  providers: [...neighborhoodProviders],
  controllers: [NeighborhoodController],
  exports: [...neighborhoodProviders], // Export para que otros módulos puedan usar
})
export class NeighborhoodModule {}
