import { DataSource } from 'typeorm';

import { HomeSlideEntity } from 'src/infrastructure/persistence/home-slide.entity';
import { ModuleEntity } from 'src/infrastructure/persistence/module.entity';
import { EntityEntity } from 'src/infrastructure/persistence/entity.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

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