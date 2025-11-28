import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';
import { EtherealNotificationService } from '../../adapters/outbound/email/ethereal-notification.service';
import { UserRepositoryAdapter } from '../../adapters/outbound/repositories/user-repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

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
