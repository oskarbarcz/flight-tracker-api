import { Module } from '@nestjs/common';
import {
  SimbriefClient,
  SimbriefClientProvider,
} from './client/simbrief.client';

@Module({
  providers: [SimbriefClientProvider],
  exports: [SimbriefClient],
})
export class SimbriefModule {}
