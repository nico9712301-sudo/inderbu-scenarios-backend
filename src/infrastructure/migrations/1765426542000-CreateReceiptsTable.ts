import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReceiptsTable1765426542000 implements MigrationInterface {
  name = 'CreateReceiptsTable1765426542000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla ya existe
    const tableExists = await queryRunner.hasTable('receipts');
    if (tableExists) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE \`inderbu\`.\`receipts\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`fk_reservation_id\` INT NOT NULL,
        \`fk_template_id\` INT NOT NULL,
        \`pdf_url\` VARCHAR(500) NOT NULL,
        \`generated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`sent_at\` TIMESTAMP NULL,
        \`sent_to_email\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_receipts_reservation\` (\`fk_reservation_id\`),
        INDEX \`idx_receipts_template\` (\`fk_template_id\`),
        INDEX \`idx_receipts_generated_at\` (\`generated_at\`),
        CONSTRAINT \`fk_receipts_reservation\` FOREIGN KEY (\`fk_reservation_id\`)
          REFERENCES \`inderbu\`.\`reservations\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_receipts_template\` FOREIGN KEY (\`fk_template_id\`)
          REFERENCES \`inderbu\`.\`templates\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`inderbu\`.\`receipts\``);
  }
}