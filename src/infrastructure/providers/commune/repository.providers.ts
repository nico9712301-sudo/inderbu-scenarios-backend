import { CommuneRepositoryAdapter } from 'src/infrastructure/adapters/outbound/repositories/commune-repository.adapter';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.COMMUNE,
    useClass: CommuneRepositoryAdapter,
  },
];
