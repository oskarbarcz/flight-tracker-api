import { PrismaService } from '../../src/core/provider/prisma/prisma.service';
import { loadAircraft } from './resource/aircrafts.seed';
import { loadOperators } from './resource/operators.seed';
import { loadCabinLayouts } from './resource/cabin-layouts.seed';
import { loadCabinLayoutVersions } from './resource/cabin-layout-versions.seed';
import { loadAirports } from './resource/airports.seed';
import { loadFlights } from './resource/flights.seed';
import { loadManifestFlights } from './resource/manifest-flights.seed';
import { loadFlightManifests } from './resource/flight-manifests.seed';
import { loadUsers } from './resource/users.seed';
import { loadSessions } from './resource/session.seed';
import { loadUserTokens } from './resource/user-token.seed';
import { loadTerminals } from './resource/terminals.seed';
import { loadParkingPositions } from './resource/parking-positions.seed';
import { loadGates } from './resource/gates.seed';
import { loadRunways } from './resource/runways.seed';
import { loadDelay } from './resource/delay.seed';
import { loadUserTravel } from './resource/user-travel.seed';
import { loadUserAircraft } from './resource/user-aircraft.seed';
import { loadAircraftReposition } from './resource/aircraft-reposition.seed';
import { loadWeather } from './resource/weather.seed';
import { loadNotams } from './resource/notams.seed';
import { loadCrew, loadFlightCrew } from './resource/crew.seed';
import { loadRotations } from './resource/rotations.seed';
import { loadStatistics } from './resource/statistics.seed';

export async function loadResources() {
  const prisma = new PrismaService();

  try {
    await prisma.$transaction(
      async (tx) => {
        await loadAirports(tx);
        await loadWeather(tx);
        await loadNotams(tx);
        await loadTerminals(tx);
        await loadParkingPositions(tx);
        await loadGates(tx);
        await loadRunways(tx);
        await loadOperators(tx);
        await loadCrew(tx);
        await loadCabinLayouts(tx);
        await loadCabinLayoutVersions(tx);
        await loadAircraft(tx);
        await loadUsers(tx);
        await loadSessions(tx);
        await loadUserTokens(tx);
        await loadFlights(tx);
        await loadManifestFlights(tx);
        await loadFlightManifests(tx);
        await loadFlightCrew(tx);
        await loadRotations(tx);
        await loadDelay(tx);
        await loadUserTravel(tx);
        await loadUserAircraft(tx);
        await loadAircraftReposition(tx);
        await loadStatistics(tx);
      },
      { maxWait: 15_000, timeout: 120_000 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
