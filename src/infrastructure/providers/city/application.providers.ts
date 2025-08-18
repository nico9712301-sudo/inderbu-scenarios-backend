import { CityApplicationService } from 'src/core/application/services/city-application.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.CITY,
    useClass: CityApplicationService,
  },
];
