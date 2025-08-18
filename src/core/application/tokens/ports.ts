export const APPLICATION_PORTS = {
  SCENARIO: 'IScenarioApplicationPort',
  SUB_SCENARIO: 'ISubScenarioApplicationPort',
  ACTIVITY_AREA: 'IActivityAreaApplicationPort',
  USER: 'IUserApplicationPort',
  CITY: 'ICityApplicationPort',
  COMMUNE: 'ICommuneApplicationPort',
  NEIGHBORHOOD: 'INeighborhoodApplicationPort',
  RESERVATION: 'IReservationApplicationPort',
  NOTIFICATION_SERVICE: 'INotificationService',
  ROLE: 'IRoleApplicationPort',
  HOME_SLIDE: 'IHomeSlideApplicationPort',
} as const;

export const DOMAIN_SERVICES = {
  RESERVATION_DATE_CALCULATOR: 'ReservationDateCalculatorDomainService',
  RESERVATION_CONFLICT_DETECTOR: 'ReservationConflictDetectorDomainService',
  RESERVATION_INSTANCE_GENERATOR: 'ReservationInstanceGeneratorDomainService',
  RESERVATION_AVAILABILITY_CHECKER:
    'ReservationAvailabilityCheckerDomainService',
} as const;
