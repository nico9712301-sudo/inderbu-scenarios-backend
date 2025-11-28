import { ActivityAreaApplicationService } from '../../../core/application/services/activity-area-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const activityAreaApplicationProviders = [
  {
    provide: APPLICATION_PORTS.ACTIVITY_AREA,
    useClass: ActivityAreaApplicationService,
  },
];
