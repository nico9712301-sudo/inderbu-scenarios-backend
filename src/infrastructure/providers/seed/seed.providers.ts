import { repositoryEntitiesProviders } from './repository-entities.providers';
import { loaderStrategyProviders } from './loader-strategy.providers';
import { serviceProviders } from './service.providers';
import { seederProviders } from './seeder.providers';

export const seedProviders = [
  ...serviceProviders,
  ...seederProviders,
  ...repositoryEntitiesProviders,
  ...loaderStrategyProviders,
];
