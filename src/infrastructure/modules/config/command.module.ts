import { CommandModule } from 'nestjs-command';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SeedingModule } from './seeding.module';
import { AppCommandService } from '../../../core/application/services/app-command.service';

@Module({
  imports: [
    CommandModule,
    DatabaseModule, // Añade esto para tener acceso a DATA_SOURCE.MYSQL
    SeedingModule, // Añade esto para tener acceso a SeedingService
  ],
  providers: [AppCommandService],
  exports: [AppCommandService], // Exporta el servicio para usarlo en AppModule
})
export class AppCommandModule {}
