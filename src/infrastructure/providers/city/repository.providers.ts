import { CityRepositoryAdapter } from '../../adapters/outbound/repositories/city-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.CITY,
    useClass: CityRepositoryAdapter,
  },
];
