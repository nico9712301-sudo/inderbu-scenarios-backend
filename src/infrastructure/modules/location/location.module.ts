import { Module } from '@nestjs/common';
import { CityModule } from './city.module';
import { CommuneModule } from './commune.module';
import { NeighborhoodModule } from './neighborhood.module';

@Module({
  imports: [CityModule, CommuneModule, NeighborhoodModule],
  providers: [],
})
export class LocationModule {}
