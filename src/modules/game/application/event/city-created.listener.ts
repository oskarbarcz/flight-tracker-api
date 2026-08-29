import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus } from '@nestjs/cqrs';
import {
  CityEventType,
  CityWasCreatedEvent,
} from '../../../../core/domain/events/dto/city.event';
import { GeneratePostcardCommand } from '../command/postcard/generate-postcard.command';
import { getErrorMessage } from '../../../../core/utils/error-message';

@Injectable()
export class CityCreatedListener {
  private readonly logger = new Logger(CityCreatedListener.name);

  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent(CityEventType.CityWasCreated)
  async onCityWasCreated(event: CityWasCreatedEvent): Promise<void> {
    const { cityId, name, country } = event.payload;

    const command = new GeneratePostcardCommand(cityId, name, country);

    try {
      await this.commandBus.execute(command);
    } catch (error) {
      this.logger.error(
        `Could not draw a postcard for ${name}: ${getErrorMessage(error)}`,
      );
    }
  }
}
