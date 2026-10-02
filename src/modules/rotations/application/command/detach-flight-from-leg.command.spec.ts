import {
  DetachFlightFromLegCommand,
  DetachFlightFromLegHandler,
} from './detach-flight-from-leg.command';
import { RotationStatus } from '../../model/rotation.model';
import { FlightStatus } from '../../../flights/model/flight.model';
import {
  LegLockedError,
  RotationNotActiveError,
} from '../../model/error/rotation.error';

const ROTATION_ID = '8a4d7cb0-1c50-4a2e-9e33-6d2f7bd1c0aa';
const LEG_ID = 'f0c5d2a7-5e60-4bb1-9a06-6e0a51e2d3c1';
const FLIGHT_ID = 'c4b8a5e2-3f71-4d0c-8a52-91b7c6d4e8f3';
const ACTOR_ID = '2d9f1c74-8b3e-4a56-9c0d-71e5f2a8b6c4';

function rotation(rotationStatus: RotationStatus, flightStatus: FlightStatus) {
  return {
    id: ROTATION_ID,
    status: rotationStatus,
    legs: [
      {
        id: LEG_ID,
        departure: { id: 'a' },
        arrival: { id: 'b' },
        flight: {
          id: FLIGHT_ID,
          flightNumber: 'LH41',
          status: flightStatus,
        },
      },
    ],
  };
}

describe('DetachFlightFromLegHandler', () => {
  let repository: { findById: jest.Mock; setLegFlight: jest.Mock };
  let handler: DetachFlightFromLegHandler;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      setLegFlight: jest.fn(),
    };
    handler = new DetachFlightFromLegHandler(repository as never);
  });

  it.each([
    RotationStatus.Draft,
    RotationStatus.Ready,
    RotationStatus.InProgress,
  ])('detaches a pre-check-in flight from a %s rotation', async (status) => {
    repository.findById.mockResolvedValue(
      rotation(status, FlightStatus.Created),
    );

    const command = new DetachFlightFromLegCommand(
      ROTATION_ID,
      LEG_ID,
      ACTOR_ID,
    );
    await handler.execute(command);

    expect(repository.setLegFlight).toHaveBeenCalledWith(
      ROTATION_ID,
      LEG_ID,
      null,
      ACTOR_ID,
    );
  });

  it.each([RotationStatus.Finished, RotationStatus.Canceled])(
    'rejects detaching from a %s rotation',
    async (status) => {
      repository.findById.mockResolvedValue(
        rotation(status, FlightStatus.Created),
      );

      const command = new DetachFlightFromLegCommand(
        ROTATION_ID,
        LEG_ID,
        ACTOR_ID,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        RotationNotActiveError,
      );
      expect(repository.setLegFlight).not.toHaveBeenCalled();
    },
  );

  it('rejects detaching a checked-in flight from a draft rotation', async () => {
    repository.findById.mockResolvedValue(
      rotation(RotationStatus.Draft, FlightStatus.CheckedIn),
    );

    const command = new DetachFlightFromLegCommand(
      ROTATION_ID,
      LEG_ID,
      ACTOR_ID,
    );

    await expect(handler.execute(command)).rejects.toThrow(LegLockedError);
    expect(repository.setLegFlight).not.toHaveBeenCalled();
  });
});
