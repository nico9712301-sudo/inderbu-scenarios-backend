import { CommandModule } from 'nestjs-command';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AppCommandService } from '../../../core/application/services/app-command.service';

@Module({
  imports: [
    CommandModule,
    DatabaseModule, // Añade esto para tener acceso a DATA_SOURCE.MYSQL
  ],
  providers: [AppCommandService],
  exports: [AppCommandService], // Exporta el servicio para usarlo en AppModule
})
export class AppCommandModule {}
