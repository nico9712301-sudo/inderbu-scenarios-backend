import { ReservationRepositoryAdapter } from '../../adapters/outbound/repositories/reservation-repository.adapter';
import { ReservationTimeslotRepositoryAdapter } from '../../adapters/outbound/repositories/reservation-timeslot-repository.adapter';
import { ReservationInstanceRepositoryAdapter } from '../../adapters/outbound/repositories/reservation-instance-repository.adapter';
import { ReservationStateRepositoryAdapter } from '../../adapters/outbound/repositories/reservation-state.repository.adapter';
import { REPOSITORY_PORTS } from '../../tokens/ports';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.RESERVATION,
    useClass: ReservationRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.RESERVATION_TIMESLOT,
    useClass: ReservationTimeslotRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.RESERVATION_INSTANCE,
    useClass: ReservationInstanceRepositoryAdapter,
  },
  {
    provide: REPOSITORY_PORTS.RESERVATION_STATE,
    useClass: ReservationStateRepositoryAdapter,
  },
];
