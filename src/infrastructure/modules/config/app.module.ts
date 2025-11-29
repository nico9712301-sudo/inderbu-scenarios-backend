import { Module, OnApplicationBootstrap, Logger, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { SeedingService } from '../../../core/application/services/seeding/seeding.service';
import { ENV_CONFIG } from '../../config/env.constants';
import { DATA_SOURCE } from '../../tokens/data_sources';
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
    @Inject(DATA_SOURCE.MYSQL)
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const isDevEnvironment =
      this.configService.get(ENV_CONFIG.APP.NODE_ENV) === 'development';
    const seedDbEnv = this.configService.get(ENV_CONFIG.APP.SEED_DB);

    // En desarrollo: siempre ejecutar seeders
    if (isDevEnvironment) {
      this.logger.log(
        '🌱 Modo desarrollo detectado - Ejecutando seeding automático',
      );
      await this.seedingService.seed();
      return;
    }

    // En producción: verificar si hay datos antes de ejecutar seeders
    const shouldSeed = await this.shouldRunSeeding(seedDbEnv);
    
    if (shouldSeed) {
      this.logger.log(
        '🌱 Modo producción - Tablas vacías detectadas. Ejecutando seeding automático.',
      );
      await this.seedingService.seed();
    } else {
      this.logger.log(
        '🚫 Modo producción - Seeding deshabilitado. Las tablas ya tienen datos o SEED_DB=false.',
      );
    }
  }

  /**
   * Determina si se deben ejecutar seeders en producción
   * @param seedDbEnv Valor de SEED_DB
   * @returns true si se deben ejecutar seeders
   */
  private async shouldRunSeeding(seedDbEnv: string | undefined): Promise<boolean> {
    this.logger.log(`🔍 Verificando si se deben ejecutar seeders. SEED_DB=${seedDbEnv}`);
    
    // Si SEED_DB está explícitamente en 'true', ejecutar siempre
    if (seedDbEnv === 'true') {
      this.logger.log('✅ SEED_DB=true - Ejecutando seeders forzadamente');
      return true;
    }

    // Si SEED_DB está explícitamente en 'false', no ejecutar
    if (seedDbEnv === 'false') {
      this.logger.log('🚫 SEED_DB=false - Seeders deshabilitados');
      return false;
    }

    // Si no está configurado, verificar si las tablas están vacías
    this.logger.log('🔍 SEED_DB no configurado - Verificando si las tablas están vacías...');
    
    try {
      // Verificar algunas tablas clave para determinar si hay datos
      const keyTables = ['roles', 'cities', 'communes', 'neighborhoods'];
      let hasData = false;
      const tableStatus: Record<string, number> = {};

      for (const table of keyTables) {
        try {
          const result = await this.dataSource.query(
            `SELECT COUNT(*) as count FROM \`${table}\``,
          );
          const count = parseInt(result[0]?.count || '0', 10);
          tableStatus[table] = count;
          this.logger.log(`  📊 Tabla ${table}: ${count} registros`);
          
          if (count > 0) {
            hasData = true;
          }
        } catch (error: any) {
          // Si la tabla no existe, asumir que está vacía
          if (error?.code === 'ER_NO_SUCH_TABLE') {
            this.logger.log(`  ⚠️  Tabla ${table} no existe aún`);
            tableStatus[table] = 0;
            continue;
          }
          this.logger.error(`  ❌ Error verificando tabla ${table}: ${error.message}`);
          throw error;
        }
      }

      // Si no hay datos, ejecutar seeders automáticamente
      const shouldRun = !hasData;
      this.logger.log(
        `📋 Resumen: ${hasData ? 'Hay datos' : 'No hay datos'} en tablas clave. ${shouldRun ? '✅ Ejecutando seeders' : '🚫 No ejecutando seeders'}`,
      );
      
      return shouldRun;
    } catch (error: any) {
      this.logger.error(
        `❌ Error verificando datos en tablas: ${error.message}. No se ejecutarán seeders automáticamente.`,
      );
      return false;
    }
  }
}
