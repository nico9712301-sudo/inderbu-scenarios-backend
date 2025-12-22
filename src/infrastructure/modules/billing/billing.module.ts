import { Module, forwardRef } from '@nestjs/common';

// Controllers
import {
  SubScenarioPricingController,
  ReceiptController,
  PaymentProofController,
  TemplateController,
  NotificationController,
} from '../../adapters/inbound/http/controllers';

// Providers
import { billingProviders } from '../../providers/billing';

// Services
import { ReceiptEmailService } from '../../adapters/outbound/email/receipt-email.service';
import { CloudflareR2Service } from '../../adapters/outbound/file-storage/cloudflare-r2.service';
import { ReceiptHtmlRendererDomainService } from '../../../core/domain/services/receipt-html-renderer.domain-service';

// External dependencies that might be needed
import { DatabaseModule } from '../database/database.module';
import { ReservationModule } from '../reservation.module';
import { SubScenarioModule } from '../sub-scenario.module';
import { UserModule } from '../user.module';

@Module({
  imports: [
    DatabaseModule, // Provides DATA_SOURCE.MYSQL
    // Import related modules for cross-domain dependencies
    forwardRef(() => ReservationModule),
    forwardRef(() => SubScenarioModule), // Usar forwardRef para evitar dependencia circular
    UserModule, // Provides IUserRepositoryPort
  ],
  controllers: [
    SubScenarioPricingController,
    ReceiptController,
    PaymentProofController,
    TemplateController,
    NotificationController,
  ],
  providers: [
    ...billingProviders,
    ReceiptEmailService,
    ReceiptHtmlRendererDomainService,
    CloudflareR2Service,
  ],
  exports: [
    // Export application services for use in other modules
    ...billingProviders,
    ReceiptEmailService,
    ReceiptHtmlRendererDomainService,
    CloudflareR2Service,
  ],
})
export class BillingModule {}