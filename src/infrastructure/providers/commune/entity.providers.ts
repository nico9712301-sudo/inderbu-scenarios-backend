import { DataSource } from 'typeorm';

import { CommuneEntity } from '../../persistence/commune.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.COMMUNE,
    useFactory: (datasource: DataSource) => {
      return datasource.getRepository(CommuneEntity);
    },
    inject: [DATA_SOURCE.MYSQL],
  },
];
