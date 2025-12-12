import {
  PricingDomainService,
  PaymentValidationDomainService,
  ReceiptGenerationDomainService,
} from '../../../core/domain/services';

export const billingDomainServiceProviders = [
  PricingDomainService,
  PaymentValidationDomainService,
  ReceiptGenerationDomainService,
];