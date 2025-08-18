import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { EtherealNotificationService } from 'src/infrastructure/adapters/outbound/email/ethereal-notification.service';
import { UserRepositoryAdapter } from 'src/infrastructure/adapters/outbound/repositories/user-repository.adapter';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.USER,
    useClass: UserRepositoryAdapter,
  },
  {
    provide: APPLICATION_PORTS.NOTIFICATION_SERVICE,
    useClass: EtherealNotificationService,
  },
];
