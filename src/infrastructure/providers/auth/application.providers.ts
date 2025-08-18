import { UserApplicationService } from 'src/core/application/services/user-application.service';
import { AuthApplicationService } from 'src/core/application/services/auth.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.USER,
    useClass: UserApplicationService,
  },
  AuthApplicationService,
];
