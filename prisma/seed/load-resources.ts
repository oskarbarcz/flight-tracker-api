import { loadAircraft } from './resource/aircrafts.seed';
import { loadOperators } from './resource/operators.seed';
import { loadAirports } from './resource/airports.seed';
import { loadFlights } from './resource/flights.seed';
import { loadUsers } from './resource/users.seed';
import { loadRotations } from './resource/rotations.seed';
import { loadTerminals } from './resource/terminals.seed';
import { loadGates } from './resource/gates.seed';
import { loadRunways } from './resource/runways.seed';
import { loadDelay } from './resource/delay.seed';
import { loadUserTravel } from './resource/user-travel.seed';

export async function loadResources() {
  await loadAirports();
  await loadTerminals();
  await loadGates();
  await loadRunways();
  await loadOperators();
  await loadAircraft();
  await loadUsers();
  await loadRotations();
  await loadFlights();
  await loadDelay();
  await loadUserTravel();
}
