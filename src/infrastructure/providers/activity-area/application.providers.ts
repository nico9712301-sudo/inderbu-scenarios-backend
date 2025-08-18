import { ActivityAreaApplicationService } from 'src/core/application/services/activity-area-application.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

export const activityAreaApplicationProviders = [
  {
    provide: APPLICATION_PORTS.ACTIVITY_AREA,
    useClass: ActivityAreaApplicationService,
  },
];
