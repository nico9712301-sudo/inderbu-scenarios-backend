import { billingRepositoryProviders } from './repository.providers';
import { billingRepositoryEntityProviders } from './repository-entities.providers';
import { billingApplicationProviders } from './application.providers';
import { billingDomainServiceProviders } from './domain-services.providers';

export const billingProviders = [
  ...billingRepositoryEntityProviders,
  ...billingRepositoryProviders,
  ...billingApplicationProviders,
  ...billingDomainServiceProviders,
];