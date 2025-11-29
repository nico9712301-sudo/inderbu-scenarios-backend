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
      // - En desarrollo: solo si DB_SYNCHRONIZE=true explícitamente
      // - En producción: solo si DB_SYNCHRONIZE=true (temporal, para crear tablas iniciales)
      // Después de crear tablas, desactivar DB_SYNCHRONIZE y usar migraciones
      const shouldSynchronize = synchronizeEnv === 'true';
      
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
        logger.log('MySQL Data Source has been initialized!');
      } catch (error) {
        logger.error('Error initializing MySQL Data Source:', error);
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return dataSource;
    },
    inject: [ConfigService],
  },
];
