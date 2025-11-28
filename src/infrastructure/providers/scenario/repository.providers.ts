import { FieldSurfaceTypeRepositoryAdapter } from '../../adapters/outbound/repositories/field-surface-type.repository.adapter';
import { ActivityAreaRepositoryAdapter } from '../../adapters/outbound/repositories/activity-area-repository.adapter';
import { NeighborhoodRepositoryAdapter } from '../../adapters/outbound/repositories/neighborhood-repository.adapter';
import { SubScenarioRepositoryAdapter } from '../../adapters/outbound/repositories/sub-scenario-repository.adapter';
import { ScenarioRepositoryAdapter } from '../../adapters/outbound/repositories/scenario-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.SUB_SCENARIO,
    useClass: SubScenarioRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.NEIGHBORHOOD,
    useClass: NeighborhoodRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.SCENARIO,
    useClass: ScenarioRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.ACTIVITY_AREA,
    useClass: ActivityAreaRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.FIELD_SURFACE,
    useClass: FieldSurfaceTypeRepositoryAdapter,
  },
];
