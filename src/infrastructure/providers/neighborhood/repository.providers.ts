import { NeighborhoodRepositoryAdapter } from 'src/infrastructure/adapters/outbound/repositories/neighborhood-repository.adapter';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.NEIGHBORHOOD,
    useClass: NeighborhoodRepositoryAdapter,
  },
];
