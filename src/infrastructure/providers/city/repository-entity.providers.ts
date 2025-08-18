import { DataSource } from 'typeorm';

import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { CityEntity } from 'src/infrastructure/persistence/city.entity';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.CITY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CityEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
