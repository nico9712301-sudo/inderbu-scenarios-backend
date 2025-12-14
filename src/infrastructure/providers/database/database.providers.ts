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

      // Crear DataSource primero para verificar si hay tablas
      const tempDataSource = new DataSource({
        type: 'mysql',
        timezone: 'Z', // UTC - usar 'Z' en lugar de '+00:00' para evitar conversiones
        host: configService.get(ENV_CONFIG.DATABASE.HOST),
        port: configService.get<number>(ENV_CONFIG.DATABASE.PORT),
        username: configService.get(ENV_CONFIG.DATABASE.USER),
        password: configService.get(ENV_CONFIG.DATABASE.PASSWORD),
        database: configService.get(ENV_CONFIG.DATABASE.NAME),
        entities: [...persistenceEntities],
        migrations: ['dist/infrastructure/migrations/**/*.js'],
        migrationsTableName: 'migrations',
        synchronize: false, // Temporal, lo ajustaremos después
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
            '  DB_SYNCHRONIZE=false pero no hay tablas. Activando synchronize temporalmente para crear tablas iniciales.',
          );
        } else if (synchronizeEnv !== 'false' && !hasTables) {
          // Si no está configurado y no hay tablas, activar por defecto
          shouldSynchronize = true;
        } else {
          shouldSynchronize = false;
        }

        await tempDataSource.destroy().catch((err) => {
          logger.warn(` Error cerrando tempDataSource: ${err.message}`);
        });
      } catch (error: any) {
        // Si falla la conexión o la consulta, asumir que no hay tablas
        logger.warn(
          `  Error verificando tablas: ${error.message}. Activando synchronize por defecto.`,
        );
        shouldSynchronize = synchronizeEnv !== 'false';
        if (tempDataSource.isInitialized) {
          await tempDataSource.destroy().catch((err) => {
            logger.warn(` Error cerrando tempDataSource: ${err.message}`);
          });
        }
      }

      logger.log(
        `🔧 Configuración: DB_SYNCHRONIZE=${synchronizeEnv}, synchronize=${shouldSynchronize}`,
      );

      // Crear DataSource final con synchronize configurado y pool optimizado
      const dataSource = new DataSource({
        type: 'mysql',
        timezone: 'Z', // UTC - usar 'Z' en lugar de '+00:00' para evitar conversiones
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
      } catch (error: any) {
        // Si el error es de columna duplicada y synchronize está activo, 
        // es probable que la columna ya exista en la BD pero TypeORM no la detectó correctamente
        if (
          error?.code === 'ER_DUP_FIELDNAME' &&
          shouldSynchronize &&
          (error?.sqlMessage?.includes('Duplicate column name') || 
           error?.message?.includes('Duplicate column name'))
        ) {
          logger.warn(
            `⚠️  Columna duplicada detectada durante synchronize: ${error.sqlMessage || error.message}. Esto es normal si la columna ya existe en la base de datos.`,
          );
          logger.warn(
            `⚠️  Considera desactivar DB_SYNCHRONIZE y usar migraciones para evitar este warning.`,
          );
          // Intentar reinicializar sin synchronize para evitar más errores
          // o simplemente continuar ya que la columna existe
          try {
            // Destruir el dataSource actual
            if (dataSource.isInitialized) {
              await dataSource.destroy();
            }
            // Crear nuevo DataSource sin synchronize
            const dataSourceWithoutSync = new DataSource({
              type: 'mysql',
              timezone: 'Z',
              host: configService.get(ENV_CONFIG.DATABASE.HOST),
              port: configService.get<number>(ENV_CONFIG.DATABASE.PORT),
              username: configService.get(ENV_CONFIG.DATABASE.USER),
              password: configService.get(ENV_CONFIG.DATABASE.PASSWORD),
              database: configService.get(ENV_CONFIG.DATABASE.NAME),
              entities: [...persistenceEntities],
              migrations: ['dist/infrastructure/migrations/**/*.js'],
              migrationsTableName: 'migrations',
              synchronize: false, // Desactivar synchronize para evitar más errores
            });
            await dataSourceWithoutSync.initialize();
            logger.log(
              `✅ MySQL Data Source reinicializado sin synchronize debido a columnas duplicadas.`,
            );
            return dataSourceWithoutSync;
          } catch (retryError: any) {
            logger.error('Error reinicializando DataSource:', retryError);
            throw new Error(`Database connection failed: ${retryError.message}`);
          }
        } else {
          logger.error('Error initializing MySQL Data Source:', error);
          throw new Error(`Database connection failed: ${error.message}`);
        }
      }

      return dataSource;
    },
    inject: [ConfigService],
  },
];
