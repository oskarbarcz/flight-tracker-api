import { loadAircraft } from './resource/aircrafts.seed';
import { loadOperators } from './resource/operators.seed';
import { loadAirports } from './resource/airports.seed';
import { loadFlights } from './resource/flights.seed';
import { loadUsers } from './resource/users.seed';
import { loadRotations } from './resource/rotations.seed';

export async function loadResources() {
  await loadAirports();
  await loadOperators();
  await loadAircraft();
  await loadUsers();
  await loadRotations();
  await loadFlights();
}
