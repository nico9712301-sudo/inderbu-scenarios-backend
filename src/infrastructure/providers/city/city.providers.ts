import { repositoryEntityProviders } from './repository-entity.providers';
import { applicationProviders } from './application.providers';
import { repositoryProviders } from './repository.providers';

export const cityProviders = [
  ...repositoryEntityProviders,
  ...repositoryProviders,
  ...applicationProviders,
];
