import { Module } from '@nestjs/common';

import { CityController } from '../../adapters/inbound/http/controllers/city.controller';
import { cityProviders } from '../../providers/city/city.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CityController],
  providers: [...cityProviders],
  exports: [...cityProviders], // Export providers para que otros módulos puedan usarlos
})
export class CityModule {}
