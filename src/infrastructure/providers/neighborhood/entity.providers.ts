import { DataSource } from 'typeorm';

import { NeighborhoodEntity } from 'src/infrastructure/persistence/neighborhood.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.NEIGHBORHOOD,
    useFactory: (datasource: DataSource) => {
      return datasource.getRepository(NeighborhoodEntity);
    },
    inject: [DATA_SOURCE.MYSQL],
  },
];
