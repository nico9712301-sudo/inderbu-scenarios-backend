import { DataSource } from 'typeorm';

import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { CityEntity } from '../../persistence/city.entity';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.CITY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CityEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
