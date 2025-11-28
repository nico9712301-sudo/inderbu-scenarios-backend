import { Module } from '@nestjs/common';

import { APPLICATION_PORTS } from '../../core/application/tokens/ports';
import { EtherealNotificationService } from '../adapters/outbound/email/ethereal-notification.service';

@Module({
  providers: [
    {
      provide: APPLICATION_PORTS.NOTIFICATION_SERVICE,
      useClass: EtherealNotificationService,
    },
  ],
  exports: [APPLICATION_PORTS.NOTIFICATION_SERVICE],
})
export class EmailModule {}
