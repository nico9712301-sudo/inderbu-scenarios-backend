import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { ISeeder } from './interfaces/seeder.interface';

@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);
  private seeders: ISeeder[] = [];

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit(): void {
    const providers = this.discoveryService.getProviders();

    this.seeders = providers
      .filter(
        (wrapper) =>
          wrapper.instance &&
          typeof (wrapper.instance as { seed?: unknown }).seed === 'function' &&
          !(wrapper.instance instanceof SeedingService),
      )
      .map((wrapper) => wrapper.instance as ISeeder);

    this.logger.log(
      `Seeders descubiertos: ${this.seeders.map((seeder) => seeder.constructor.name).join(', ')}`,
    );
  }

  async seed(): Promise<void> {
    for (const seeder of this.seeders) {
      await seeder.seed();
      this.logger.log(`${seeder.constructor.name} ejecutado correctamente.`);
    }

    this.logger.log('🌱 Siembra completada exitosamente.');
  }
}
