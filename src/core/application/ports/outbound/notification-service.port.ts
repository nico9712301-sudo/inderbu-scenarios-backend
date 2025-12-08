export interface TimeslotInfo {
  startTime: string;
  endTime: string;
}

export interface INotificationService {
  sendAccountConfirmation(email: string, token: string): Promise<void>;
  sendReservationPending(
    email: string,
    reservationId: number,
    subScenarioName: string,
    initialDate: Date,
    finalDate: Date | undefined,
    timeslots: TimeslotInfo[],
  ): Promise<void>;
  sendReservationConfirmed(
    email: string,
    reservationId: number,
    subScenarioName: string,
    initialDate: Date,
    confirmedAt: Date,
    finalDate: Date | undefined,
    timeslots: TimeslotInfo[],
  ): Promise<void>;
  sendReservationCancelled(
    email: string,
    reservationId: number,
    subScenarioName: string,
    initialDate: Date,
    finalDate?: Date,
  ): Promise<void>;
}
