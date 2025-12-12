import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTemplatesTable1765426541000 implements MigrationInterface {
  name = 'CreateTemplatesTable1765426541000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla ya existe
    const tableExists = await queryRunner.hasTable('templates');
    if (tableExists) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE \`inderbu\`.\`templates\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`type\` ENUM('receipt', 'invoice', 'email') NOT NULL DEFAULT 'receipt',
        \`content\` LONGTEXT NOT NULL COMMENT 'JSON structure defining the template layout and components',
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_by\` INT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_templates_type\` (\`type\`),
        INDEX \`idx_templates_is_active\` (\`is_active\`),
        INDEX \`idx_templates_created_by\` (\`created_by\`),
        FULLTEXT \`ft_templates_name\` (\`name\`),
        CONSTRAINT \`fk_templates_created_by\` FOREIGN KEY (\`created_by\`)
          REFERENCES \`inderbu\`.\`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // Insertar template por defecto para recibos
    await queryRunner.query(`
      INSERT INTO \`inderbu\`.\`templates\` (\`name\`, \`type\`, \`content\`, \`is_active\`) VALUES
      ('Recibo Básico', 'receipt', '{
        "components": [
          {"type": "logo", "position": {"x": 0, "y": 0}, "size": {"width": 100, "height": 50}},
          {"type": "title", "content": "RECIBO DE PAGO", "position": {"x": 0, "y": 60}},
          {"type": "client_data", "position": {"x": 0, "y": 100}},
          {"type": "reservation_details", "position": {"x": 0, "y": 150}},
          {"type": "cost_table", "position": {"x": 0, "y": 200}},
          {"type": "total", "position": {"x": 0, "y": 250}},
          {"type": "payment_info", "position": {"x": 0, "y": 300}},
          {"type": "footer", "content": "Gracias por su pago", "position": {"x": 0, "y": 350}}
        ]
      }', TRUE)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`inderbu\`.\`templates\``);
  }
}