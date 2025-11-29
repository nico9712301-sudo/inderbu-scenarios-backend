import { Command } from 'nestjs-command';
import { DataSource } from 'typeorm';
import { Inject, Logger } from '@nestjs/common';
import { DATA_SOURCE } from '../../../infrastructure/tokens/data_sources';

export class AppCommandService {
  private readonly logger = new Logger(AppCommandService.name);

  constructor(
    @Inject(DATA_SOURCE.MYSQL)
    private readonly datasource: DataSource,
  ) {}

  @Command({
    command: 'start:seeds',
    describe: 'Inicia todos los seeds',
  })
  async create() {
    const queryRunner = this.datasource.createQueryRunner();

    try {
      await queryRunner.connect();
      this.logger.log('Ejecutando seeders...');
      this.runSeeders();
    } catch {
      if (queryRunner.isTransactionActive) {
        this.logger.log('Revirtiendo la transacción...');
        await queryRunner.rollbackTransaction();
      }
    }
  }

  @Command({
    command: 'migration:run',
    describe: 'Ejecuta todas las migraciones pendientes',
  })
  async runMigrations() {
    try {
      this.logger.log('Ejecutando migraciones pendientes...');
      const migrations = await this.datasource.runMigrations();
      
      if (migrations.length === 0) {
        this.logger.log('✅ No hay migraciones pendientes.');
      } else {
        this.logger.log(
          `✅ ${migrations.length} migración(es) ejecutada(s) exitosamente:`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  - ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error('❌ Error ejecutando migraciones:', error);
      throw error;
    }
  }

  @Command({
    command: 'migration:revert',
    describe: 'Revierte la última migración ejecutada',
  })
  async revertMigration() {
    try {
      this.logger.log('Revirtiendo última migración...');
      await this.datasource.undoLastMigration();
      this.logger.log('✅ Última migración revertida exitosamente.');
    } catch (error) {
      this.logger.error('❌ Error revirtiendo migración:', error);
      throw error;
    }
  }

  @Command({
    command: 'migration:show',
    describe: 'Muestra el estado de las migraciones',
  })
  async showMigrations() {
    try {
      const migrations = await this.datasource.showMigrations();
      this.logger.log('Estado de migraciones:');
      this.logger.log(`  Migraciones ejecutadas: ${migrations}`);
    } catch (error) {
      this.logger.error('❌ Error mostrando estado de migraciones:', error);
      throw error;
    }
  }

  private runSeeders(): void {
    this.logger.log('Ejecutando seeders...');
    // await seedCities(datasource);
    this.logger.log('Seeders ejecutados correctamente.');
  }
}
