import { repositoryEntityProviders } from './repository-entity.providers';
import { applicationProviders } from './application.providers';
import { repositoryProviders } from './repository.providers';
import { strategyProviders } from './strategy.providers';

export const authEntitiesProviders = [
  ...repositoryEntityProviders,
  ...repositoryProviders,
  ...applicationProviders,
  ...strategyProviders,
];
