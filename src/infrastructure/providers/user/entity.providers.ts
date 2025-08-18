import { DataSource } from 'typeorm';

import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { UserEntity } from 'src/infrastructure/persistence/user.entity';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.USER,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
