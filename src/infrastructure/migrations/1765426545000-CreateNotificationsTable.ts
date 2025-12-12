import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1765426545000 implements MigrationInterface {
  name = 'CreateNotificationsTable1765426545000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla ya existe
    const tableExists = await queryRunner.hasTable('notifications');
    if (tableExists) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE \`inderbu\`.\`notifications\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`type\` ENUM('payment_proof_uploaded', 'receipt_generated', 'receipt_sent') NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`fk_reservation_id\` INT NULL,
        \`fk_payment_proof_id\` INT NULL,
        \`fk_receipt_id\` INT NULL,
        \`is_read\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`read_at\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_notifications_type\` (\`type\`),
        INDEX \`idx_notifications_is_read\` (\`is_read\`),
        INDEX \`idx_notifications_created_at\` (\`created_at\`),
        INDEX \`idx_notifications_reservation\` (\`fk_reservation_id\`),
        CONSTRAINT \`fk_notifications_reservation\` FOREIGN KEY (\`fk_reservation_id\`)
          REFERENCES \`inderbu\`.\`reservations\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_notifications_payment_proof\` FOREIGN KEY (\`fk_payment_proof_id\`)
          REFERENCES \`inderbu\`.\`payment_proofs\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_notifications_receipt\` FOREIGN KEY (\`fk_receipt_id\`)
          REFERENCES \`inderbu\`.\`receipts\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`inderbu\`.\`notifications\``);
  }
}