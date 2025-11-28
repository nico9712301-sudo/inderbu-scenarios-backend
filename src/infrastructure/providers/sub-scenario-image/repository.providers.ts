import { Provider } from '@nestjs/common';
import { REPOSITORY_PORTS } from '../../tokens/ports';
import { SubScenarioImageRepositoryAdapter } from '../../adapters/outbound/repositories/sub-scenario-image-repository.adapter';

export const repositoryProviders: Provider[] = [
  {
    provide: REPOSITORY_PORTS.SUB_SCENARIO_IMAGE,
    useClass: SubScenarioImageRepositoryAdapter,
  },
];
