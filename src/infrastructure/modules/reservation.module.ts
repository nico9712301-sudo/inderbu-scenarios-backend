import { Module } from '@nestjs/common';

import { ReservationController } from '../adapters/inbound/http/controllers/reservation.controller';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email.module';
import { UserModule } from './user.module';
import { SubScenarioModule } from './sub-scenario.module';
import { reservationProviders } from '../providers/reservation/reservation.providers';

@Module({
  imports: [DatabaseModule, EmailModule, UserModule, SubScenarioModule],
  controllers: [ReservationController],
  providers: [...reservationProviders],
  exports: [...reservationProviders],
})
export class ReservationModule {}
