import { DataSource } from 'typeorm';

import { FieldSurfaceTypeEntity } from '../../persistence/field-surface-type.entity';
import { ActivityAreaEntity } from '../../persistence/activity-area.entity';
import { NeighborhoodEntity } from '../../persistence/neighborhood.entity';
import { SubScenarioEntity } from '../../persistence/sub-scenario.entity';
import { ScenarioEntity } from '../../persistence/scenario.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntitiesProviders = [
  {
    provide: MYSQL_REPOSITORY.SCENARIO,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ScenarioEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SUB_SCENARIO,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SubScenarioEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.NEIGHBORHOOD,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(NeighborhoodEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ACTIVITY_AREA,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityAreaEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.FIELD_SURFACE_TYPE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(FieldSurfaceTypeEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
