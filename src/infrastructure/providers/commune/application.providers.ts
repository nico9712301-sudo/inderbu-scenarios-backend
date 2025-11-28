import { CommuneApplicationService } from '../../../core/application/services/commune-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.COMMUNE,
    useClass: CommuneApplicationService,
  },
];
