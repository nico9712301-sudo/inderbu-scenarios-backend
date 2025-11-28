import { ActivityAreaRepositoryAdapter } from '../../adapters/outbound/repositories/activity-area-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const activityAreaRepositoryProviders = [
  {
    provide: REPOSITORY_PORTS.ACTIVITY_AREA,
    useClass: ActivityAreaRepositoryAdapter,
  },
];
