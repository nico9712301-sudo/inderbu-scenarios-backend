import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../tokens/data_sources';
import { ENV_CONFIG } from '../../config/env.constants';
import { persistenceEntities } from './entities';
import { Logger } from '@nestjs/common';

export const databaseProviders = [
  {
    provide: DATA_SOURCE.MYSQL,
    useFactory: async (configService: ConfigService) => {
      const logger = new Logger('DatabaseProvider');
      logger.log('Desde database providers' + ENV_CONFIG.STORAGE.BUCKET_HOST);
      logger.log('Desde database providers' + ENV_CONFIG.DATABASE.USER);
      
      const nodeEnv = configService.get(ENV_CONFIG.APP.NODE_ENV);
      const synchronizeEnv = configService.get(ENV_CONFIG.DATABASE.SYNCHRONIZE);
      
      // Synchronize:
      // - Si DB_SYNCHRONIZE está explícitamente en 'false', usar false
      // - Si DB_SYNCHRONIZE está en 'true', usar true
      // - Si no está configurado, usar true por defecto (para crear tablas iniciales)
      // Después de crear tablas, configurar DB_SYNCHRONIZE=false y usar migraciones
      const shouldSynchronize = synchronizeEnv !== 'false';
      
      logger.log(
        `🔧 Configuración de sincronización: DB_SYNCHRONIZE=${synchronizeEnv}, synchronize=${shouldSynchronize}`,
      );
      
      const dataSource = new DataSource({
        type: 'mysql',
        // fuerza UTC−5 (Bogotá) en lugar de UTC puro
        timezone: '-05:00',
        // devuelve los campos DATE/DATETIME como strings en lugar de JS Dates
        dateStrings: true,
        host: configService.get(ENV_CONFIG.DATABASE.HOST),
        port: configService.get<number>(ENV_CONFIG.DATABASE.PORT),
        username: configService.get(ENV_CONFIG.DATABASE.USER),
        password: configService.get(ENV_CONFIG.DATABASE.PASSWORD),
        database: configService.get(ENV_CONFIG.DATABASE.NAME),
        entities: [...persistenceEntities],
        migrations: ['dist/infrastructure/migrations/**/*.js'],
        migrationsTableName: 'migrations',
        synchronize: shouldSynchronize,
      });

      try {
        await dataSource.initialize();
        logger.log(
          `✅ MySQL Data Source inicializado! Synchronize: ${shouldSynchronize}`,
        );
      } catch (error) {
        logger.error('Error initializing MySQL Data Source:', error);
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return dataSource;
    },
    inject: [ConfigService],
  },
];
