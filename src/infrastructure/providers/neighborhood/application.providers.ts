import { NeighborhoodApplicationService } from 'src/core/application/services/neighborhood-application.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.NEIGHBORHOOD,
    useClass: NeighborhoodApplicationService,
  },
];
