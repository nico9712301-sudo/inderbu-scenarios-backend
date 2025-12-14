import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyReceiptsTableRemovePdfUrlAddVariablesValues1765426547000 implements MigrationInterface {
  name = 'ModifyReceiptsTableRemovePdfUrlAddVariablesValues1765426547000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna pdf_url existe antes de eliminarla
    const pdfUrlExists = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'receipts' 
      AND COLUMN_NAME = 'pdf_url'
    `);

    if (pdfUrlExists.length > 0) {
      // Eliminar la columna pdf_url
      await queryRunner.query(`
        ALTER TABLE \`inderbu\`.\`receipts\`
        DROP COLUMN \`pdf_url\`
      `);
    }

    // Verificar si la columna variables_values ya existe
    const variablesValuesExists = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'receipts' 
      AND COLUMN_NAME = 'variables_values'
    `);

    if (variablesValuesExists.length === 0) {
      // Agregar la columna variables_values como JSON
      await queryRunner.query(`
        ALTER TABLE \`inderbu\`.\`receipts\`
        ADD COLUMN \`variables_values\` JSON NOT NULL
        COMMENT 'JSON object containing hourlyPrice and totalCost'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: eliminar variables_values y restaurar pdf_url
    const variablesValuesExists = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'receipts' 
      AND COLUMN_NAME = 'variables_values'
    `);

    if (variablesValuesExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE \`inderbu\`.\`receipts\`
        DROP COLUMN \`variables_values\`
      `);
    }

    const pdfUrlExists = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'receipts' 
      AND COLUMN_NAME = 'pdf_url'
    `);

    if (pdfUrlExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`inderbu\`.\`receipts\`
        ADD COLUMN \`pdf_url\` VARCHAR(500) NOT NULL
        COMMENT 'URL to the generated PDF receipt in Cloudflare R2'
      `);
    }
  }
}
