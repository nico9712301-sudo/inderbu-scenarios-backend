import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SeedingService } from '../../../core/application/services/seeding/seeding.service';
import { ENV_CONFIG } from '../../config/env.constants';
import { LocationModule } from '../location/location.module';
import { DatabaseModule } from '../database/database.module';
import { ActivityAreaModule } from '../activity-area.module';
import { SubScenarioModule } from '../sub-scenario.module';
import { ScenarioModule } from '../scenario.module';
import { ReservationModule } from '../reservation.module';
import { HomeSlideModule } from '../home-slide.module';
import { AppCommandModule } from './command.module';
import { SeedingModule } from './seeding.module';
import { EmailModule } from '../email.module';
import { AuthModule } from '../auth.module';
import { UserModule } from '../user.module';
import { RoleModule } from '../role.module';
import { FieldSurfaceTypeModule } from '../field-surface-type.module';

@Module({
  imports: [
    DatabaseModule, // Esto da acceso al proveedor 'DATA_SOURCE.MYSQL'
    AuthModule,
    UserModule,
    LocationModule,
    ScenarioModule,
    SubScenarioModule,
    ActivityAreaModule,
    ReservationModule,
    HomeSlideModule,
    EmailModule,
    RoleModule,
    FieldSurfaceTypeModule,
    AppCommandModule,
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la aplicación
    }),
    SeedingModule,
  ],
  providers: [],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private readonly seedingService: SeedingService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const isDevEnvironment =
      this.configService.get(ENV_CONFIG.APP.NODE_ENV) === 'development';

    // Seeding solo en desarrollo - nunca en producción
    // En producción se deben usar migraciones para cambios de esquema
    // y datos iniciales deben estar en la base de datos
    if (isDevEnvironment) {
      this.logger.log(
        '🌱 Modo desarrollo detectado - Ejecutando seeding automático',
      );
      await this.seedingService.seed();
    } else {
      this.logger.log(
        '🚫 Modo producción - Seeding deshabilitado. Use migraciones para cambios de esquema.',
      );
    }
  }
}
