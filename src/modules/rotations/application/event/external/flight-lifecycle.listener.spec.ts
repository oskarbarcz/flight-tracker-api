import { FlightLifecycleListener } from './flight-lifecycle.listener';
import { RotationStatus } from '../../../model/rotation.model';
import {
  FlightEventScope,
  FlightWasClosedEvent,
  PilotCheckedInEvent,
} from '../../../../../core/domain/events/dto/flight.events';

const ROTATION_ID = 'a1111111-1111-4111-8111-111111111111';

function checkedInEvent(flightId: string): PilotCheckedInEvent {
  return new PilotCheckedInEvent({
    flightId,
    scope: FlightEventScope.User,
    actorId: null,
    aircraftId: 'ac',
    airportIds: [],
  });
}

function closedEvent(flightId: string): FlightWasClosedEvent {
  return new FlightWasClosedEvent({
    flightId,
    scope: FlightEventScope.System,
    actorId: null,
    aircraftId: 'ac',
  });
}

function rotation(
  status: RotationStatus,
  legs: Array<{ id: string; flightId: string }>,
) {
  return {
    id: ROTATION_ID,
    operatorId: 'op',
    pilotId: 'pilot',
    status,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: null,
    legs: legs.map((leg) => ({
      id: leg.id,
      departure: { id: 'a', iataCode: 'AAA', icaoCode: 'AAAA', name: 'A' },
      arrival: { id: 'b', iataCode: 'BBB', icaoCode: 'BBBB', name: 'B' },
      offBlockTime: new Date('2025-01-01T10:00:00.000Z'),
      onBlockTime: new Date('2025-01-01T11:00:00.000Z'),
      blockTime: 60,
      flight: { id: leg.flightId, flightNumber: 'X1', status: 'created' },
    })),
  };
}

describe('FlightLifecycleListener (rotations)', () => {
  let repository: {
    findLegByFlightId: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };
  let listener: FlightLifecycleListener;

  beforeEach(() => {
    repository = {
      findLegByFlightId: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    listener = new FlightLifecycleListener(repository as never);
  });

  describe('on pilot checked in', () => {
    it('advances a ready rotation to in_progress on the first check-in', async () => {
      repository.findLegByFlightId.mockResolvedValue({
        id: 'leg1',
        rotationId: ROTATION_ID,
      });
      repository.findById.mockResolvedValue(
        rotation(RotationStatus.Ready, [
          { id: 'leg1', flightId: 'f1' },
          { id: 'leg2', flightId: 'f2' },
        ]),
      );

      await listener.onPilotCheckedIn(checkedInEvent('f1'));

      expect(repository.updateStatus).toHaveBeenCalledWith(
        ROTATION_ID,
        RotationStatus.InProgress,
        null,
      );
    });

    it('does nothing when the rotation is already in_progress', async () => {
      repository.findLegByFlightId.mockResolvedValue({
        id: 'leg2',
        rotationId: ROTATION_ID,
      });
      repository.findById.mockResolvedValue(
        rotation(RotationStatus.InProgress, [
          { id: 'leg1', flightId: 'f1' },
          { id: 'leg2', flightId: 'f2' },
        ]),
      );

      await listener.onPilotCheckedIn(checkedInEvent('f2'));

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('does nothing when the flight is not attached to any leg', async () => {
      repository.findLegByFlightId.mockResolvedValue(null);

      await listener.onPilotCheckedIn(checkedInEvent('unknown'));

      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('on flight closed', () => {
    it('finishes the rotation when the last leg flight closes', async () => {
      repository.findLegByFlightId.mockResolvedValue({
        id: 'leg2',
        rotationId: ROTATION_ID,
      });
      repository.findById.mockResolvedValue(
        rotation(RotationStatus.InProgress, [
          { id: 'leg1', flightId: 'f1' },
          { id: 'leg2', flightId: 'f2' },
        ]),
      );

      await listener.onFlightWasClosed(closedEvent('f2'));

      expect(repository.updateStatus).toHaveBeenCalledWith(
        ROTATION_ID,
        RotationStatus.Finished,
        null,
      );
    });

    it('does nothing when a non-last leg flight closes', async () => {
      repository.findLegByFlightId.mockResolvedValue({
        id: 'leg1',
        rotationId: ROTATION_ID,
      });
      repository.findById.mockResolvedValue(
        rotation(RotationStatus.InProgress, [
          { id: 'leg1', flightId: 'f1' },
          { id: 'leg2', flightId: 'f2' },
        ]),
      );

      await listener.onFlightWasClosed(closedEvent('f1'));

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('does nothing when the rotation is not in_progress', async () => {
      repository.findLegByFlightId.mockResolvedValue({
        id: 'leg2',
        rotationId: ROTATION_ID,
      });
      repository.findById.mockResolvedValue(
        rotation(RotationStatus.Ready, [
          { id: 'leg1', flightId: 'f1' },
          { id: 'leg2', flightId: 'f2' },
        ]),
      );

      await listener.onFlightWasClosed(closedEvent('f2'));

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
