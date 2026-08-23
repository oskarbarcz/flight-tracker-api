import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  CargoContentClass,
  CargoDeck,
  CargoShipmentStatus,
  CargoTransferRole,
  CargoUnitKind,
  Prisma,
} from 'prisma/client/client';

export type NewCargoShipment = {
  commodityId: string;
  description: string;
  awb: string;
  pieces: number;
  grossKg: number;
  volumeM3: number;
  shc: string[];
  shipper: string;
  consignee: string;
  origin: string;
  destination: string;
  transferRole: CargoTransferRole;
  onwardCarrier: string | null;
  onwardFlightNumber: string | null;
  connectionMinutes: number | null;
  dangerousGoods: Prisma.InputJsonValue | typeof Prisma.DbNull;
};

export type NewCargoUnit = {
  kind: CargoUnitKind;
  deck: CargoDeck | null;
  compartment: number | null;
  positionDesignator: string | null;
  uldType: string | null;
  uldSerial: string | null;
  uldOwner: string | null;
  tareKg: number;
  grossKg: number;
  volumeM3: number;
  contentClass: CargoContentClass;
  beyondDestination: string | null;
  sealed: boolean;
  shipments: NewCargoShipment[];
};

export type CargoUnitRow = Prisma.FlightCargoUnitGetPayload<{
  include: { shipments: true };
}>;

@Injectable()
export class CargoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replace(flightId: string, units: NewCargoUnit[]): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.flightCargoShipment.deleteMany({ where: { flightId } });
      await transaction.flightCargoUnit.deleteMany({ where: { flightId } });

      for (const unit of units) {
        const { shipments, ...fields } = unit;

        await transaction.flightCargoUnit.create({
          data: {
            ...fields,
            flightId,
            shipments: {
              create: shipments.map((shipment) => ({ ...shipment, flightId })),
            },
          },
        });
      }
    });
  }

  async findByFlight(
    flightId: string,
    status?: CargoShipmentStatus,
  ): Promise<CargoUnitRow[]> {
    return this.prisma.flightCargoUnit.findMany({
      where: { flightId },
      include: {
        shipments: {
          where: status ? { status } : undefined,
          orderBy: { awb: 'asc' },
        },
      },
      orderBy: [{ deck: 'asc' }, { compartment: 'asc' }, { id: 'asc' }],
    });
  }

  async countForFlight(flightId: string): Promise<number> {
    return this.prisma.flightCargoUnit.count({ where: { flightId } });
  }

  async networkAirports(
    excluding: string[],
  ): Promise<{ iataCode: string; continent: string }[]> {
    return this.prisma.airport.findMany({
      where: { iataCode: { notIn: excluding } },
      select: { iataCode: true, continent: true },
    });
  }

  async carrierCodes(excluding: string): Promise<string[]> {
    const operators = await this.prisma.operator.findMany({
      where: { iataCode: { not: excluding } },
      select: { iataCode: true },
      distinct: ['iataCode'],
    });

    return operators.map((operator) => operator.iataCode);
  }
}
