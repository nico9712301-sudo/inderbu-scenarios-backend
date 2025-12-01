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
      
      // Configuración optimizada para serverless
      const poolSize = parseInt(configService.get(ENV_CONFIG.DATABASE.POOL_SIZE) || '1', 10);
      const acquireTimeout = parseInt(configService.get(ENV_CONFIG.DATABASE.ACQUIRE_TIMEOUT) || '10000', 10);
      const timeout = parseInt(configService.get(ENV_CONFIG.DATABASE.TIMEOUT) || '10000', 10);

      // Crear DataSource optimizado para verificar si hay tablas
      const tempDataSource = new DataSource({
        type: 'mysql',
        timezone: '-05:00',
        dateStrings: true,
        host: configService.get(ENV_CONFIG.DATABASE.HOST),
        port: configService.get<number>(ENV_CONFIG.DATABASE.PORT),
        username: configService.get(ENV_CONFIG.DATABASE.USER),
        password: configService.get(ENV_CONFIG.DATABASE.PASSWORD),
        database: configService.get(ENV_CONFIG.DATABASE.NAME),
        entities: [...persistenceEntities],
        migrations: ['dist/infrastructure/migrations/**/*.js'],
        migrationsTableName: 'migrations',
        synchronize: false, // Temporal, lo ajustaremos después
        // Configuración de pool optimizada para serverless
        poolSize: poolSize,
        acquireTimeout: acquireTimeout,
        maxQueryExecutionTime: 5000,
        // Configuración adicional para MySQL
        extra: {
          acquireTimeout: acquireTimeout,
          timeout: timeout,
        },
      });

      let shouldSynchronize = false;
      
      try {
        await tempDataSource.initialize();
        
        // Verificar si existe al menos una tabla (ej: migrations)
        const tables = await tempDataSource.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?`,
          [configService.get(ENV_CONFIG.DATABASE.NAME)],
        );
        
        const tableCount = parseInt(tables[0]?.count || '0', 10);
        const hasTables = tableCount > 0;
        
        // Lógica de synchronize:
        // - Si DB_SYNCHRONIZE='true' explícitamente → true
        // - Si DB_SYNCHRONIZE='false' pero NO hay tablas → true (crear tablas iniciales)
        // - Si DB_SYNCHRONIZE='false' y hay tablas → false (usar migraciones)
        // - Si no está configurado y no hay tablas → true (crear tablas iniciales)
        if (synchronizeEnv === 'true') {
          shouldSynchronize = true;
        } else if (synchronizeEnv === 'false' && !hasTables) {
          // Forzar synchronize si no hay tablas, incluso si DB_SYNCHRONIZE=false
          shouldSynchronize = true;
          logger.warn(
            '⚠️  DB_SYNCHRONIZE=false pero no hay tablas. Activando synchronize temporalmente para crear tablas iniciales.',
          );
        } else if (synchronizeEnv !== 'false' && !hasTables) {
          // Si no está configurado y no hay tablas, activar por defecto
          shouldSynchronize = true;
        } else {
          shouldSynchronize = false;
        }
        
        await tempDataSource.destroy().catch((err) => {
          logger.warn(`⚠️ Error cerrando tempDataSource: ${err.message}`);
        });
      } catch (error: any) {
        // Si falla la conexión o la consulta, asumir que no hay tablas
        logger.warn(
          `⚠️  Error verificando tablas: ${error.message}. Activando synchronize por defecto.`,
        );
        shouldSynchronize = synchronizeEnv !== 'false';
        if (tempDataSource.isInitialized) {
          await tempDataSource.destroy().catch((err) => {
          logger.warn(`⚠️ Error cerrando tempDataSource: ${err.message}`);
        });
        }
      }
      
      logger.log(
        `🔧 Configuración: DB_SYNCHRONIZE=${synchronizeEnv}, synchronize=${shouldSynchronize}, poolSize=${poolSize}, timeout=${timeout}ms`,
      );
      
      // Crear DataSource final con synchronize configurado y pool optimizado
      const dataSource = new DataSource({
        type: 'mysql',
        timezone: '-05:00',
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
        // Configuración de pool optimizada para serverless
        poolSize: poolSize,
        acquireTimeout: acquireTimeout,
        maxQueryExecutionTime: 5000,
        // Configuración adicional para evitar conexiones colgantes
        extra: {
          acquireTimeout: acquireTimeout,
          timeout: timeout,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        },
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
