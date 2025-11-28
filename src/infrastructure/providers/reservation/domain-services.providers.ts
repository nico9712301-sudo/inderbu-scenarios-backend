import { ReservationDateCalculatorDomainService } from '../../../core/domain/services/reservation-date-calculator.domain-service';
import { ReservationConflictDetectorDomainService } from '../../../core/domain/services/reservation-conflict-detector.domain-service';
import { ReservationInstanceGeneratorDomainService } from '../../../core/domain/services/reservation-instance-generator.domain-service';
import { ReservationAvailabilityCheckerDomainService } from '../../../core/domain/services/reservation-availability-checker.domain-service';
import { DOMAIN_SERVICES } from '../../../core/application/tokens/ports';

export const domainServiceProviders = [
  {
    provide: DOMAIN_SERVICES.RESERVATION_DATE_CALCULATOR,
    useClass: ReservationDateCalculatorDomainService,
  },
  {
    provide: DOMAIN_SERVICES.RESERVATION_CONFLICT_DETECTOR,
    useClass: ReservationConflictDetectorDomainService,
  },
  {
    provide: DOMAIN_SERVICES.RESERVATION_INSTANCE_GENERATOR,
    useClass: ReservationInstanceGeneratorDomainService,
  },
  {
    provide: DOMAIN_SERVICES.RESERVATION_AVAILABILITY_CHECKER,
    useClass: ReservationAvailabilityCheckerDomainService,
  },
];
