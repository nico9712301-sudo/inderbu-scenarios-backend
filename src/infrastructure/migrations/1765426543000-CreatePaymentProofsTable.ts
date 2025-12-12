import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentProofsTable1765426543000 implements MigrationInterface {
  name = 'CreatePaymentProofsTable1765426543000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla ya existe
    const tableExists = await queryRunner.hasTable('payment_proofs');
    if (tableExists) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE \`inderbu\`.\`payment_proofs\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`fk_reservation_id\` INT NOT NULL,
        \`file_url\` VARCHAR(500) NOT NULL,
        \`uploaded_by_user_id\` INT NOT NULL,
        \`original_filename\` VARCHAR(255) NULL,
        \`file_size\` BIGINT NULL,
        \`mime_type\` VARCHAR(100) NULL,
        \`uploaded_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_payment_proofs_reservation\` (\`fk_reservation_id\`),
        INDEX \`idx_payment_proofs_user\` (\`uploaded_by_user_id\`),
        INDEX \`idx_payment_proofs_uploaded_at\` (\`uploaded_at\`),
        CONSTRAINT \`fk_payment_proofs_reservation\` FOREIGN KEY (\`fk_reservation_id\`)
          REFERENCES \`inderbu\`.\`reservations\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_payment_proofs_user\` FOREIGN KEY (\`uploaded_by_user_id\`)
          REFERENCES \`inderbu\`.\`users\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`inderbu\`.\`payment_proofs\``);
  }
}