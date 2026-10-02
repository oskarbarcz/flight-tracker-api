import {
  AttachFlightToLegCommand,
  AttachFlightToLegHandler,
} from './attach-flight-to-leg.command';
import { RotationStatus } from '../../model/rotation.model';
import { FlightStatus } from '../../../flights/model/flight.model';
import { AirportType } from '../../../airports/model/airport.model';
import { RotationNotActiveError } from '../../model/error/rotation.error';

const ROTATION_ID = '5f1a9c3e-77d2-4b48-8c19-2ab6e0d5f741';
const LEG_ID = '9b2e4d61-08fa-4c37-bd52-1c7e6f3a9052';
const FLIGHT_ID = 'e7c3b810-4a95-4d26-9f18-53b0a2c8d6e9';
const OPERATOR_ID = '3a8d5f21-6b74-4e09-9c53-8f1b2d7e4a60';
const DEPARTURE_ID = 'b6f2c419-2d83-4a17-95e0-7c4a1b8d3f52';
const ARRIVAL_ID = 'd1e8a743-9c26-4f50-8b39-0a5d7e2c6b18';
const ACTOR_ID = '4c9b7e02-1f65-4a83-9d27-6b0e5a3c8f14';

function rotation(status: RotationStatus) {
  return {
    id: ROTATION_ID,
    operatorId: OPERATOR_ID,
    status,
    legs: [
      {
        id: LEG_ID,
        flightNumber: 'LH41',
        departure: { id: DEPARTURE_ID },
        arrival: { id: ARRIVAL_ID },
        flight: null,
      },
    ],
  };
}

function flight() {
  return {
    id: FLIGHT_ID,
    flightNumber: 'LH41',
    status: FlightStatus.Created,
    operator: { id: OPERATOR_ID },
    airports: [
      { id: DEPARTURE_ID, type: AirportType.Departure },
      { id: ARRIVAL_ID, type: AirportType.Destination },
    ],
  };
}

describe('AttachFlightToLegHandler', () => {
  let repository: {
    findById: jest.Mock;
    findLegByFlightId: jest.Mock;
    setLegFlight: jest.Mock;
  };
  let queryBus: { execute: jest.Mock };
  let handler: AttachFlightToLegHandler;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findLegByFlightId: jest.fn().mockResolvedValue(null),
      setLegFlight: jest.fn(),
    };
    queryBus = { execute: jest.fn().mockResolvedValue(flight()) };
    handler = new AttachFlightToLegHandler(
      repository as never,
      queryBus as never,
    );
  });

  it.each([
    RotationStatus.Draft,
    RotationStatus.Ready,
    RotationStatus.InProgress,
  ])('attaches a matching flight to a %s rotation', async (status) => {
    repository.findById.mockResolvedValue(rotation(status));

    const command = new AttachFlightToLegCommand(
      ROTATION_ID,
      LEG_ID,
      FLIGHT_ID,
      ACTOR_ID,
    );
    await handler.execute(command);

    expect(repository.setLegFlight).toHaveBeenCalledWith(
      ROTATION_ID,
      LEG_ID,
      FLIGHT_ID,
      ACTOR_ID,
    );
  });

  it.each([RotationStatus.Finished, RotationStatus.Canceled])(
    'rejects attaching to a %s rotation',
    async (status) => {
      repository.findById.mockResolvedValue(rotation(status));

      const command = new AttachFlightToLegCommand(
        ROTATION_ID,
        LEG_ID,
        FLIGHT_ID,
        ACTOR_ID,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        RotationNotActiveError,
      );
      expect(queryBus.execute).not.toHaveBeenCalled();
      expect(repository.setLegFlight).not.toHaveBeenCalled();
    },
  );
});
