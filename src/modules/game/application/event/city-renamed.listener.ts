import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus } from '@nestjs/cqrs';
import {
  CityEventType,
  CityWasRenamedEvent,
} from '../../../../core/domain/events/dto/city.event';
import { GeneratePostcardCommand } from '../command/postcard/generate-postcard.command';
import { getErrorMessage } from '../../../../core/utils/error-message';

@Injectable()
export class CityRenamedListener {
  private readonly logger = new Logger(CityRenamedListener.name);

  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent(CityEventType.CityWasRenamed)
  async onCityWasRenamed(event: CityWasRenamedEvent): Promise<void> {
    const { cityId, name, country, previousName } = event.payload;

    this.logger.log(
      `Redrawing the postcard for ${name}, which was called ${previousName} until now`,
    );

    const command = new GeneratePostcardCommand(cityId, name, country);

    try {
      await this.commandBus.execute(command);
    } catch (error) {
      this.logger.error(
        `Could not redraw the postcard for ${name}: ${getErrorMessage(error)}`,
      );
    }
  }
}
