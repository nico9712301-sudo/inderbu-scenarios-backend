import { DataSource } from 'typeorm';

import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { ReservationEntity } from '../../persistence/reservation.entity';
import { ReservationTimeslotEntity } from '../../persistence/reservation-timeslot.entity';
import { ReservationInstanceEntity } from '../../persistence/reservation-instance.entity';
import { ReservationStateEntity } from '../../persistence/reservation-state.entity';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.RESERVATION,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReservationEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.RESERVATION_TIMESLOT,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReservationTimeslotEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.RESERVATION_INSTANCE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReservationInstanceEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.RESERVATION_STATE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReservationStateEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
