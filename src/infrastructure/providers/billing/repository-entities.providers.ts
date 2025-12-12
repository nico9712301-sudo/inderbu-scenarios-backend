import { DataSource } from 'typeorm';
import {
  TemplateEntity,
  SubScenarioPriceEntity,
  ReceiptEntity,
  PaymentProofEntity,
  NotificationEntity,
} from '../../persistence';

export const billingRepositoryEntityProviders = [
  {
    provide: 'TemplateRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TemplateEntity),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'SubScenarioPriceRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SubScenarioPriceEntity),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'ReceiptRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ReceiptEntity),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'PaymentProofRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PaymentProofEntity),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'NotificationRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(NotificationEntity),
    inject: ['DATABASE_CONNECTION'],
  },
];