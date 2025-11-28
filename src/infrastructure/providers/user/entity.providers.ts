import { DataSource } from 'typeorm';

import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { UserEntity } from '../../persistence/user.entity';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.USER,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
