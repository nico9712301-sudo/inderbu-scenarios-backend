import { SubScenarioApplicationService } from '../../../core/application/services/sub-scenario-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.SUB_SCENARIO,
    useClass: SubScenarioApplicationService,
  },
];
