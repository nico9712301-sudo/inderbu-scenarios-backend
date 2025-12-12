import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  TemplateEntity,
  SubScenarioPriceEntity,
  ReceiptEntity,
  PaymentProofEntity,
  NotificationEntity,
} from '../../persistence';

// Controllers
import {
  SubScenarioPricingController,
  ReceiptController,
  PaymentProofController,
} from '../../adapters/inbound/http/controllers';

// Providers
import { billingProviders } from '../../providers/billing';

// External dependencies that might be needed
import { ReservationModule } from '../reservation.module';
import { SubScenarioModule } from '../sub-scenario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateEntity,
      SubScenarioPriceEntity,
      ReceiptEntity,
      PaymentProofEntity,
      NotificationEntity,
    ]),
    // Import related modules for cross-domain dependencies
    ReservationModule,
    SubScenarioModule,
  ],
  controllers: [
    SubScenarioPricingController,
    ReceiptController,
    PaymentProofController,
  ],
  providers: [
    ...billingProviders,
  ],
  exports: [
    // Export application services for use in other modules
    ...billingProviders,
  ],
})
export class BillingModule {}