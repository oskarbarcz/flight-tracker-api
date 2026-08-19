import { Module } from '@nestjs/common';
import {
  AerolopaClient,
  AerolopaClientProvider,
} from './client/aerolopa.client';

@Module({
  providers: [AerolopaClientProvider],
  exports: [AerolopaClient],
})
export class AerolopaModule {}
