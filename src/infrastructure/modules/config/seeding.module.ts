import { Module } from '@nestjs/common';
import { seedProviders } from 'src/infrastructure/providers/seed/seed.providers';
import { DatabaseModule } from '../database/database.module';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DatabaseModule, DiscoveryModule],
  providers: [...seedProviders],
  exports: [...seedProviders],
})
export class SeedingModule {}
