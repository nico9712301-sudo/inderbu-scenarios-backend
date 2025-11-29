import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { persistenceEntities } from '../providers/database/entities';

// Cargar variables de entorno
config();

/**
 * DataSource configuration for TypeORM migrations
 * This is used by the TypeORM CLI to generate and run migrations
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  timezone: '-05:00', // UTC-5 (Bogotá)
  dateStrings: true,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inderbu_scenarios',
  entities: [...persistenceEntities],
  migrations: ['src/infrastructure/migrations/**/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Never use synchronize with migrations
  logging: process.env.NODE_ENV === 'development',
});

