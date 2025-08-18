import { ActivityAreaRepositoryAdapter } from 'src/infrastructure/adapters/outbound/repositories/activity-area-repository.adapter';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

export const activityAreaRepositoryProviders = [
  {
    provide: REPOSITORY_PORTS.ACTIVITY_AREA,
    useClass: ActivityAreaRepositoryAdapter,
  },
];
