import { NeighborhoodApplicationService } from '../../../core/application/services/neighborhood-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.NEIGHBORHOOD,
    useClass: NeighborhoodApplicationService,
  },
];
