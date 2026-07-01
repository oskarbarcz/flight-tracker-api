import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from './dto/event';

@Injectable()
export class DomainEventEmitter {
  constructor(private readonly emitter: EventEmitter2) {}

  emit(event: DomainEvent): void {
    this.emitter.emit((event.constructor as typeof DomainEvent).name, event);
  }

  async emitAsync(event: DomainEvent): Promise<void> {
    await this.emitter.emitAsync(
      (event.constructor as typeof DomainEvent).name,
      event,
    );
  }
}
