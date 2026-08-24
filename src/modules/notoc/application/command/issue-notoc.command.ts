import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { NotocRepository } from '../../infra/database/repository/notoc.repository';
import { composeNotoc } from '../../model/notoc';
import { NotocStageName } from '../../model/notoc.model';
import {
  FlightCargoManifest,
  CargoShipmentStatusName,
} from '../../../cargo/model/cargo-manifest.model';
import { GetFlightCargoLoadQuery } from '../../../cargo/application/query/get-flight-cargo-load.query';
import { CargoManifestNotGeneratedError } from '../../../cargo/model/error/cargo.error';
import { NotocStage, Prisma } from 'prisma/client/client';

export class IssueNotocCommand {
  constructor(
    public readonly flightId: string,
    public readonly stage: NotocStageName,
    public readonly unloadingAirport: string,
    public readonly issuedAt: Date,
  ) {}
}

@CommandHandler(IssueNotocCommand)
export class IssueNotocHandler implements ICommandHandler<IssueNotocCommand> {
  constructor(
    private readonly notocRepository: NotocRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: IssueNotocCommand): Promise<void> {
    const { flightId, stage, unloadingAirport, issuedAt } = command;
    const manifest = await this.loadOf(flightId);

    await this.notocRepository.issue(
      flightId,
      stage as unknown as NotocStage,
      issuedAt,
      composeNotoc(
        manifest,
        unloadingAirport,
      ) as unknown as Prisma.InputJsonValue,
    );
  }

  private async loadOf(flightId: string): Promise<FlightCargoManifest> {
    const query = new GetFlightCargoLoadQuery(
      flightId,
      CargoShipmentStatusName.Loaded,
    );

    try {
      return await this.queryBus.execute(query);
    } catch (error) {
      if (error instanceof CargoManifestNotGeneratedError) {
        return emptyLoad(flightId);
      }

      throw error;
    }
  }
}

function emptyLoad(flightId: string): FlightCargoManifest {
  return {
    flightId,
    holdVariant: null,
    cargoKg: 0,
    baggageKg: 0,
    bagCount: 0,
    baggageSource: null,
    containerCount: 0,
    bulkLotCount: 0,
    shipmentCount: 0,
    worstColdChainRisk: null,
    dangerousGoodsCount: 0,
    cargoAircraftOnlyCount: 0,
    transferCount: 0,
    tightestConnectionMinutes: null,
    compartmentLoad: [],
    units: [],
  };
}
