import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { CityWasCreatedEvent } from '../../../../../core/domain/events/dto/city.event';
import { DrawMissingPostcardsResponse } from '../../../model/postcard/postcard.model';

export class DrawMissingPostcardsCommand {}

@CommandHandler(DrawMissingPostcardsCommand)
export class DrawMissingPostcardsHandler implements ICommandHandler<DrawMissingPostcardsCommand> {
  constructor(
    private readonly repository: PostcardsRepository,
    private readonly eventEmitter: DomainEventEmitter,
  ) {}

  async execute(): Promise<DrawMissingPostcardsResponse> {
    const cities = await this.repository.listCitiesWithoutArt();

    for (const city of cities) {
      const claimed = await this.repository.claimForCity(v4(), city.id);
      await this.repository.startDrawing(claimed.id, v4());

      const event = new CityWasCreatedEvent({
        cityId: city.id,
        name: city.name,
        country: city.country,
      });
      this.eventEmitter.emit(event);
    }

    return {
      queued: cities.length,
      cities: cities.map((city) => ({ id: city.id, name: city.name })),
    };
  }
}
