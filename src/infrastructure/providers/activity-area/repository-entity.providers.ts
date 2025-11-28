import { DataSource } from 'typeorm';

import { ActivityAreaEntity } from '../../persistence/activity-area.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const activityAreaRepositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.ACTIVITY_AREA,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityAreaEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
