import { DataSource } from 'typeorm';
import {
  TemplateEntity,
  SubScenarioPriceEntity,
  ReceiptEntity,
  PaymentProofEntity,
  NotificationEntity,
} from '../../persistence';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const billingRepositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.TEMPLATE,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TemplateEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SUB_SCENARIO_PRICE,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SubScenarioPriceEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.RECEIPT,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ReceiptEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.PAYMENT_PROOF,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PaymentProofEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.NOTIFICATION,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(NotificationEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];