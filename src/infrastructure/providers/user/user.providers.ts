import { applicationProviders } from './application.providers';
import { repositoryProviders } from './repository.providers';
import { repositoryEntityProviders } from './entity.providers';

export const userProviders = [
  ...repositoryEntityProviders,
  ...repositoryProviders,
  ...applicationProviders,
];
