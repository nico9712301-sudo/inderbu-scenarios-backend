import { DataSource } from 'typeorm';

import { HomeSlideEntity } from '../../persistence/home-slide.entity';
import { ModuleEntity } from '../../persistence/module.entity';
import { EntityEntity } from '../../persistence/entity.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntitiesProviders = [
  {
    provide: MYSQL_REPOSITORY.HOME_SLIDE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(HomeSlideEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.MODULE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ModuleEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ENTITY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EntityEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
