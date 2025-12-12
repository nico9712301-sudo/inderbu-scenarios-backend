import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubScenarioPricesTable1765516123526 implements MigrationInterface {
    name = 'CreateSubScenarioPricesTable1765516123526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`ft_role_name\` ON \`roles\``);
        await queryRunner.query(`DROP INDEX \`ft_commune_name\` ON \`communes\``);
        await queryRunner.query(`DROP INDEX \`ft_neighborhood_name\` ON \`neighborhoods\``);
        await queryRunner.query(`DROP INDEX \`ft_fs_name\` ON \`field_surface_types\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_create\` \`can_create\` tinyint(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_edit\` \`can_edit\` tinyint(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_read\` \`can_read\` tinyint(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_delete\` \`can_delete\` tinyint(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`communes\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`communes\` ADD \`name\` varchar(150) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`communes\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`communes\` ADD \`name\` varchar(100) COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_delete\` \`can_delete\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_read\` \`can_read\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_edit\` \`can_edit\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`can_create\` \`can_create\` tinyint NOT NULL`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`ft_fs_name\` ON \`field_surface_types\` (\`name\`)`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`ft_neighborhood_name\` ON \`neighborhoods\` (\`name\`)`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`ft_commune_name\` ON \`communes\` (\`name\`)`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`ft_role_name\` ON \`roles\` (\`name\`)`);
    }

}
