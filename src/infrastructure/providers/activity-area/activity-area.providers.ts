import { DataSource } from 'typeorm';

import { activityAreaRepositoryEntityProviders } from './repository-entity.providers';
import { activityAreaApplicationProviders } from './application.providers';
import { activityAreaRepositoryProviders } from './repository.providers';

export const activityAreaProviders = [
  ...activityAreaRepositoryEntityProviders,
  ...activityAreaRepositoryProviders,
  ...activityAreaApplicationProviders,
];
