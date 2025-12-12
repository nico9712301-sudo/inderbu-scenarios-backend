import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfirmationJustificationToReservations1765426544000 implements MigrationInterface {
  name = 'AddConfirmationJustificationToReservations1765426544000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna ya existe
    const hasColumn = await queryRunner.hasColumn('reservations', 'confirmation_justification');
    if (hasColumn) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`inderbu\`.\`reservations\`
      ADD COLUMN \`confirmation_justification\` TEXT NULL
      COMMENT 'Justificación para confirmar una reserva sin comprobante de pago'
    `);

    // Agregar índice para optimizar búsquedas
    await queryRunner.query(`
      CREATE INDEX \`idx_reservations_confirmation_justification\`
      ON \`inderbu\`.\`reservations\` (\`confirmation_justification\`(100))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX \`idx_reservations_confirmation_justification\`
      ON \`inderbu\`.\`reservations\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`inderbu\`.\`reservations\`
      DROP COLUMN \`confirmation_justification\`
    `);
  }
}