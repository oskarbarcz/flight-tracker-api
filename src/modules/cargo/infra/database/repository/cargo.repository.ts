import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  CargoContentClass,
  CargoDeck,
  CargoShipmentStatus,
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
}
