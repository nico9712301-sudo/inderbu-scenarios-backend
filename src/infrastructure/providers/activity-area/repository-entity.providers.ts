import { DataSource } from 'typeorm';

import { ActivityAreaEntity } from 'src/infrastructure/persistence/activity-area.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const activityAreaRepositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.ACTIVITY_AREA,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityAreaEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
