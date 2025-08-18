import { repositoryEntitiesProviders } from './repository-entities.providers';
import { applicationProviders } from './application.providers';
import { repositoryProviders } from './repository.providers';

export const scenarioProviders = [
  ...applicationProviders,
  ...repositoryProviders,
  ...repositoryEntitiesProviders,
];
