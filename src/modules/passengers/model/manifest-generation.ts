import { CabinDeckName } from '../../cabin-layouts/model/layout-version';

export type AllocatableSeat = {
  designator: string;
  deck: CabinDeckName;
  cabin: string;
};

const PNR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PNR_LENGTH = 6;
const SHARED_PNR_CHANCE = 0.2;

export function distributePassengers(
  cabinSizes: Record<string, number>,
  total: number,
): Record<string, number> {
  const cabins = Object.keys(cabinSizes);
  const capacity = cabins.reduce((sum, cabin) => sum + cabinSizes[cabin], 0);
  const wanted = Math.max(0, Math.min(total, capacity));

  const allocation: Record<string, number> = {};
  for (const cabin of cabins) {
    allocation[cabin] = Math.floor(
      (wanted * cabinSizes[cabin]) / capacity || 0,
    );
  }

  let remainder =
    wanted - cabins.reduce((sum, cabin) => sum + allocation[cabin], 0);

  const largestFirst = [...cabins].sort(
    (one, other) =>
      cabinSizes[other] - cabinSizes[one] || one.localeCompare(other),
  );

  while (remainder > 0) {
    const cabin = largestFirst.find(
      (candidate) => allocation[candidate] < cabinSizes[candidate],
    );

    if (!cabin) {
      break;
    }

    allocation[cabin] += 1;
    remainder -= 1;
  }

  return allocation;
}

export function allocateSeats(
  seats: AllocatableSeat[],
  total: number,
): AllocatableSeat[] {
  const byCabin = new Map<string, AllocatableSeat[]>();

  for (const seat of seats) {
    const cabinSeats = byCabin.get(seat.cabin) ?? [];
    cabinSeats.push(seat);
    byCabin.set(seat.cabin, cabinSeats);
  }

  const cabinSizes: Record<string, number> = {};
  for (const [cabin, cabinSeats] of byCabin) {
    cabinSizes[cabin] = cabinSeats.length;
  }

  const allocation = distributePassengers(cabinSizes, total);
  const allocated: AllocatableSeat[] = [];

  for (const [cabin, cabinSeats] of byCabin) {
    allocated.push(...shuffle(cabinSeats).slice(0, allocation[cabin]));
  }

  return allocated;
}

export function generatePnr(): string {
  let pnr = '';

  for (let position = 0; position < PNR_LENGTH; position++) {
    pnr += PNR_ALPHABET[Math.floor(Math.random() * PNR_ALPHABET.length)];
  }

  return pnr;
}

export function assignPnrs(count: number): string[] {
  const pnrs: string[] = [];

  for (let passenger = 0; passenger < count; passenger++) {
    const sharesBooking = passenger > 0 && Math.random() < SHARED_PNR_CHANCE;

    pnrs.push(sharesBooking ? pnrs[passenger - 1] : generatePnr());
  }

  return pnrs;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapWith]] = [
      shuffled[swapWith],
      shuffled[index],
    ];
  }

  return shuffled;
}
