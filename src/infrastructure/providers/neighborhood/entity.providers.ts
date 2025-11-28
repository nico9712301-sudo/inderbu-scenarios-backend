import { DataSource } from 'typeorm';

import { NeighborhoodEntity } from '../../persistence/neighborhood.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.NEIGHBORHOOD,
    useFactory: (datasource: DataSource) => {
      return datasource.getRepository(NeighborhoodEntity);
    },
    inject: [DATA_SOURCE.MYSQL],
  },
];
