import { DataSource } from 'typeorm';

import { repositoryEntitiesProviders } from './repository-entities.providers';
import { applicationProviders } from './application.providers';
import { repositoryProviders } from './repository.providers';

export const subScenarioProviders = [
  ...applicationProviders,
  ...repositoryProviders,
  ...repositoryEntitiesProviders,
];
