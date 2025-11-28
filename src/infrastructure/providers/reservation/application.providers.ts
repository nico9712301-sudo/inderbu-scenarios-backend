import { ReservationApplicationService } from '../../../core/application/services/reservation-application.service';
import { APPLICATION_PORTS } from '../../../core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.RESERVATION,
    useClass: ReservationApplicationService,
  },
];
