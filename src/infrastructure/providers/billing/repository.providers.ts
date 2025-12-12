import { REPOSITORY_PORTS } from '../../tokens/ports';
import {
  TemplateRepositoryAdapter,
  SubScenarioPriceRepositoryAdapter,
  ReceiptRepositoryAdapter,
  PaymentProofRepositoryAdapter,
  NotificationRepositoryAdapter,
} from '../../adapters';

export const billingRepositoryProviders = [
  {
    provide: REPOSITORY_PORTS.TEMPLATE,
    useClass: TemplateRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.SUB_SCENARIO_PRICE,
    useClass: SubScenarioPriceRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.RECEIPT,
    useClass: ReceiptRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.PAYMENT_PROOF,
    useClass: PaymentProofRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.NOTIFICATION,
    useClass: NotificationRepositoryAdapter,
  },
];