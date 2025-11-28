import { UserApplicationService } from '../../../core/application/services/user-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.USER,
    useClass: UserApplicationService,
  },
];
