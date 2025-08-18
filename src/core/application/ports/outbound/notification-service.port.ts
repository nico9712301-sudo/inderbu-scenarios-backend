export interface INotificationService {
  sendAccountConfirmation(email: string, token: string): Promise<void>;
}
