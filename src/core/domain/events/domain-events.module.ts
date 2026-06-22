import { Global, Module } from '@nestjs/common';
import { DomainEventEmitter } from './domain-event-emitter';

@Global()
@Module({
  providers: [DomainEventEmitter],
  exports: [DomainEventEmitter],
})
export class DomainEventsModule {}
