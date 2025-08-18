import { repositoryEntitiesProviders } from './repository-entities.providers';
import { applicationProviders } from './application.providers';
import { repositoryProviders } from './repository.providers';

export const homeSlideProviders = [
  ...applicationProviders,
  ...repositoryProviders,
  ...repositoryEntitiesProviders,
];