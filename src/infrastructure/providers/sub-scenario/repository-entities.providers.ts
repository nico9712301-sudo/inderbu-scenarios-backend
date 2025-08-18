import { DataSource } from 'typeorm';

import { FieldSurfaceTypeEntity } from 'src/infrastructure/persistence/field-surface-type.entity';
import { ActivityAreaEntity } from 'src/infrastructure/persistence/activity-area.entity';
import { NeighborhoodEntity } from 'src/infrastructure/persistence/neighborhood.entity';
import { SubScenarioEntity } from 'src/infrastructure/persistence/sub-scenario.entity';
import { ScenarioEntity } from 'src/infrastructure/persistence/scenario.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const repositoryEntitiesProviders = [
  {
    provide: MYSQL_REPOSITORY.SUB_SCENARIO,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SubScenarioEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SCENARIO,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ScenarioEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ACTIVITY_AREA,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityAreaEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.NEIGHBORHOOD,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(NeighborhoodEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.FIELD_SURFACE_TYPE, // ¡el token SQL que usarás abajo!
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(FieldSurfaceTypeEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
