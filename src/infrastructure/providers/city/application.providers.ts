import { CityApplicationService } from '../../../core/application/services/city-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.CITY,
    useClass: CityApplicationService,
  },
];
