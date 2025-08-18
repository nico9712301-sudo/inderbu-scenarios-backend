import { ScenarioApplicationService } from 'src/core/application/services/scenario-application.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.SCENARIO,
    useClass: ScenarioApplicationService,
  },
];
