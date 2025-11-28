import { CommuneRepositoryAdapter } from '../../adapters/outbound/repositories/commune-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.COMMUNE,
    useClass: CommuneRepositoryAdapter,
  },
];
