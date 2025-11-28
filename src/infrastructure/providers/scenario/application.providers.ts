import { ScenarioApplicationService } from '../../../core/application/services/scenario-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.SCENARIO,
    useClass: ScenarioApplicationService,
  },
];
