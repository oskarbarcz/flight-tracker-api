import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  CargoContentClass,
  CargoDeck,
  CargoOffloadReason,
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
  temperatureControl: Prisma.InputJsonValue | typeof Prisma.DbNull;
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
  bagCount: number | null;
  priority: boolean;
  baggageSource: string | null;
  shipments: NewCargoShipment[];
};

export type CargoUnitRow = Prisma.FlightCargoUnitGetPayload<{
  include: { shipments: true };
}>;

export type CargoOffloadWrite = {
  shipmentId: string;
  reason: CargoOffloadReason;
  offloadedFrom: string | null;
};

export type CargoUnitTotals = {
  id: string;
  grossKg: number;
  volumeM3: number;
};

export type CargoReconciliationWrite = {
  offloads: CargoOffloadWrite[];
  emptiedUnitIds: string[];
  totals: CargoUnitTotals[];
  added: NewCargoUnit[];
};

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

  async reconcile(
    flightId: string,
    write: CargoReconciliationWrite,
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      for (const offload of write.offloads) {
        await transaction.flightCargoShipment.update({
          where: { id: offload.shipmentId },
          data: {
            status: CargoShipmentStatus.offloaded,
            offloadReason: offload.reason,
            offloadedFrom: offload.offloadedFrom,
          },
        });
      }

      for (const totals of write.totals) {
        await transaction.flightCargoUnit.update({
          where: { id: totals.id },
          data: { grossKg: totals.grossKg, volumeM3: totals.volumeM3 },
        });
      }

      for (const unitId of write.emptiedUnitIds) {
        await transaction.flightCargoUnit.update({
          where: { id: unitId },
          data: {
            positionDesignator: null,
            tareKg: 0,
            grossKg: 0,
            volumeM3: 0,
          },
        });
      }

      for (const unit of write.added) {
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
