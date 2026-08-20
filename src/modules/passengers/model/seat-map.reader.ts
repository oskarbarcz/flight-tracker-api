import { CabinSeatMap } from '../../cabin-layouts/model/cabin-seat-map.model';
import { AllocatableSeat } from './manifest-generation';

export function seatsOf(seatMap: CabinSeatMap): AllocatableSeat[] {
  return seatMap.decks.flatMap((deck) =>
    deck.seats.map((seat) => ({
      designator: seat.designator,
      deck: deck.deck,
      cabin: seat.cabin,
    })),
  );
}
