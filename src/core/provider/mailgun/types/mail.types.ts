export enum MailMessageType {
  PasswordReset = 'password_reset',
  EmailChangeConfirmation = 'email_change_confirmation',
  EmailChangeNotification = 'email_change_notification',
}

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  type: MailMessageType;
};
