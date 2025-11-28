import { NeighborhoodRepositoryAdapter } from '../../adapters/outbound/repositories/neighborhood-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.NEIGHBORHOOD,
    useClass: NeighborhoodRepositoryAdapter,
  },
];
