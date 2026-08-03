import { Module } from '@nestjs/common';
import { MailgunClient, MailgunClientProvider } from './client/mailgun.client';

@Module({
  providers: [MailgunClientProvider],
  exports: [MailgunClient],
})
export class MailgunModule {}
