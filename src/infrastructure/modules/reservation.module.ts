import { Module } from '@nestjs/common';

import { ReservationController } from '../adapters/inbound/http/controllers/reservation.controller';
import { DatabaseModule } from './database/database.module';
import { reservationProviders } from '../providers/reservation/reservation.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationController],
  providers: [...reservationProviders],
  exports: [...reservationProviders],
})
export class ReservationModule {}
