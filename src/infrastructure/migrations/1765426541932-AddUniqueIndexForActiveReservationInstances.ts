import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexForActiveReservationInstances1765426541932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Paso 1: Eliminar el constraint único existente que aplica a todas las instancias
        // TypeORM crea índices únicos con nombres específicos, intentamos eliminarlos
        // Primero verificamos qué índices únicos existen
        const uniqueIndexes = await queryRunner.query(`
            SELECT INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'reservation_instances' 
            AND NON_UNIQUE = 0
            AND INDEX_NAME != 'PRIMARY'
        `);

        // Eliminar todos los índices únicos encontrados (excepto PRIMARY)
        for (const index of uniqueIndexes) {
            try {
                await queryRunner.query(`
                    ALTER TABLE reservation_instances 
                    DROP INDEX \`${index.INDEX_NAME}\`
                `);
            } catch (error) {
                // Si el índice no existe, continuar
                console.warn(`Warning: Could not drop index ${index.INDEX_NAME}:`, error.message);
            }
        }

        // Paso 2: Crear una columna generada virtual que tenga valor solo para estados activos
        // Esta columna será NULL para estados cancelados (3) y tendrá un valor para activos (1, 2)
        // Verificamos si la columna ya existe antes de crearla
        const columns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'reservation_instances' 
            AND COLUMN_NAME = 'active_reservation_key'
        `);

        if (columns.length === 0) {
            await queryRunner.query(`
                ALTER TABLE reservation_instances
                ADD COLUMN active_reservation_key VARCHAR(255) 
                GENERATED ALWAYS AS (
                    CASE 
                        WHEN reservation_state_id IN (1, 2) 
                        THEN CONCAT(
                            CAST(sub_scenario_id AS CHAR), 
                            '-', 
                            DATE(reservation_date), 
                            '-', 
                            CAST(timeslot_id AS CHAR)
                        )
                        ELSE NULL
                    END
                ) VIRTUAL
            `);
        }

        // Paso 3: Crear un índice único sobre la columna generada
        // Esto garantiza que solo haya una instancia activa por (sub_scenario_id, reservation_date, timeslot_id)
        // Las instancias canceladas (con NULL en active_reservation_key) no interferirán
        // Verificamos si el índice ya existe antes de crearlo
        const existingIndex = await queryRunner.query(`
            SELECT INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'reservation_instances' 
            AND INDEX_NAME = 'idx_unique_active_reservation'
        `);

        if (existingIndex.length === 0) {
            await queryRunner.query(`
                CREATE UNIQUE INDEX idx_unique_active_reservation 
                ON reservation_instances (active_reservation_key)
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir: Eliminar el índice único y la columna generada
        await queryRunner.query(`
            DROP INDEX idx_unique_active_reservation 
            ON reservation_instances
        `);

        await queryRunner.query(`
            ALTER TABLE reservation_instances
            DROP COLUMN active_reservation_key
        `);

        // Restaurar el constraint único original
        await queryRunner.query(`
            ALTER TABLE reservation_instances
            ADD UNIQUE KEY unique_sub_scenario_date_timeslot (
                sub_scenario_id, 
                reservation_date, 
                timeslot_id
            )
        `);
    }

}
