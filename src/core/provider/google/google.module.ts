import { Module } from '@nestjs/common';
import {
  GoogleIdentityClient,
  GoogleIdentityClientProvider,
} from './client/google-identity.client';

@Module({
  providers: [GoogleIdentityClientProvider],
  exports: [GoogleIdentityClient],
})
export class GoogleModule {}
