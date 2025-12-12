import {
  SubScenarioPricingApplicationService,
  ReceiptManagementApplicationService,
  PaymentProofApplicationService,
  NotificationApplicationService,
  TemplateManagementApplicationService,
} from '../../../core/application/services';

export const APPLICATION_PORTS = {
  SUB_SCENARIO_PRICING: 'SubScenarioPricingApplicationPort',
  RECEIPT_MANAGEMENT: 'ReceiptManagementApplicationPort',
  PAYMENT_PROOF: 'PaymentProofApplicationPort',
  NOTIFICATION: 'NotificationApplicationPort',
  TEMPLATE_MANAGEMENT: 'TemplateManagementApplicationPort',
} as const;

export const billingApplicationProviders = [
  {
    provide: APPLICATION_PORTS.SUB_SCENARIO_PRICING,
    useClass: SubScenarioPricingApplicationService,
  },
  {
    provide: APPLICATION_PORTS.RECEIPT_MANAGEMENT,
    useClass: ReceiptManagementApplicationService,
  },
  {
    provide: APPLICATION_PORTS.PAYMENT_PROOF,
    useClass: PaymentProofApplicationService,
  },
  {
    provide: APPLICATION_PORTS.NOTIFICATION,
    useClass: NotificationApplicationService,
  },
  {
    provide: APPLICATION_PORTS.TEMPLATE_MANAGEMENT,
    useClass: TemplateManagementApplicationService,
  },
];