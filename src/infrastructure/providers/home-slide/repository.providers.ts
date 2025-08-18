import { HomeSlideRepositoryAdapter } from '../../adapters/outbound/repositories/home-slide-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.HOME_SLIDE,
    useClass: HomeSlideRepositoryAdapter,
  },
];