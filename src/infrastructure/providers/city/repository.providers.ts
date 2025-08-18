import { CityRepositoryAdapter } from 'src/infrastructure/adapters/outbound/repositories/city-repository.adapter';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.CITY,
    useClass: CityRepositoryAdapter,
  },
];
