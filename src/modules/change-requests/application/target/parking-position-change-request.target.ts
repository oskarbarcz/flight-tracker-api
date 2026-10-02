import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../core/errors/domain-error';
import { FindParkingPositionQuery } from '../../../airports/application/query/parking-position/find-parking-position.query';
import { AssertTerminalBelongsToAirportQuery } from '../../../airports/application/assert/assert-terminal-belongs-to-airport.query';
import { UpdateParkingPositionCommand } from '../../../airports/application/command/parking-positions/update-parking-position.command';
import { GetParkingPositionResponse } from '../../../airports/infra/http/request/parking-position.dto';
import { ChangeRequestTarget } from '../../model/change-request-target';
import {
  ChangeRequestChanges,
  ChangeRequestResource,
} from '../../model/change-request.model';
import {
  PARKING_POSITION_FIELDS,
  ParkingPositionValues,
} from '../../model/parking-position-change.model';
import { ChangeRequestTargetNotFoundError } from '../../model/error/change-request.error';

type ParkingPositionResource = typeof ChangeRequestResource.parkingPosition;

@Injectable()
export class ParkingPositionChangeRequestTarget implements ChangeRequestTarget<ParkingPositionResource> {
  readonly resource = ChangeRequestResource.parkingPosition;
  readonly fields = PARKING_POSITION_FIELDS;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async validate(
    targetId: string,
    changes: ChangeRequestChanges<ParkingPositionResource>,
  ): Promise<void> {
    const parkingPosition = await this.find(targetId);

    if (changes.terminalId !== undefined) {
      const query = new AssertTerminalBelongsToAirportQuery(
        parkingPosition.airportId,
        changes.terminalId,
      );
      await this.queryBus.execute(query);
    }
  }

  async read(targetId: string): Promise<ParkingPositionValues> {
    const parkingPosition = await this.find(targetId).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ChangeRequestTargetNotFoundError();
      }
      throw error;
    });

    return {
      name: parkingPosition.name,
      terminalId: parkingPosition.terminalId,
      bridge: parkingPosition.bridge,
      stairs: parkingPosition.stairs,
      deicing: parkingPosition.deicing,
      deicingDescription: parkingPosition.deicingDescription ?? null,
      gpu: parkingPosition.gpu,
      pca: parkingPosition.pca,
      type: parkingPosition.type,
      spotType: parkingPosition.spotType,
      assistance: parkingPosition.assistance,
      location: parkingPosition.location,
      noiseSensitivity: parkingPosition.noiseSensitivity,
      noiseSensitivityText: parkingPosition.noiseSensitivityText ?? null,
      noiseSensitivityStartTime:
        parkingPosition.noiseSensitivityStartTime ?? null,
      noiseSensitivityEndTime: parkingPosition.noiseSensitivityEndTime ?? null,
      fuelingOptions: parkingPosition.fuelingOptions,
      coordinates: parkingPosition.coordinates ?? null,
    };
  }

  async apply(
    targetId: string,
    changes: ChangeRequestChanges<ParkingPositionResource>,
  ): Promise<void> {
    const parkingPosition = await this.find(targetId);

    const command = new UpdateParkingPositionCommand(
      parkingPosition.airportId,
      targetId,
      changes,
    );
    await this.commandBus.execute(command);
  }

  private find(parkingPositionId: string): Promise<GetParkingPositionResponse> {
    const query = new FindParkingPositionQuery(parkingPositionId);
    return this.queryBus.execute(query);
  }
}
