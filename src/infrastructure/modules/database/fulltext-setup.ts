// src/infrastructure/database/fulltext-setup.ts
import { DataSource } from 'typeorm';

export async function ensureFullTextIndexes(ds: DataSource) {
  await ds.query(`
    ALTER TABLE sub_scenarios
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_sub_name (name);
  `);

  await ds.query(`
    ALTER TABLE scenarios
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_scen_name (name);
  `);

  await ds.query(`
    ALTER TABLE activity_areas
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_area_name (name);
  `);

  await ds.query(`
    ALTER TABLE field_surface_types
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_fs_name (name);
  `);

  await ds.query(`
    ALTER TABLE neighborhoods
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_neighborhood_name (name);
  `);

  await ds.query(`
    ALTER TABLE communes
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_commune_name (name);
  `);

  await ds.query(`
    ALTER TABLE roles
      ENGINE = InnoDB,
      MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      ADD FULLTEXT ft_role_name (name);
  `);
}
