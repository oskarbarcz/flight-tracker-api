import { Prisma } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

export async function loadTerminals(): Promise<void> {
  const terminals: Prisma.TerminalCreateManyInput[] = [
    // EDDF — Frankfurt am Main
    {
      id: 'd7fd7a84-1589-4a4f-9072-a9773f66e2b5',
      airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
      shortName: 'T1',
      fullName: 'Terminal 1',
      averageTaxiTime: 12,
      operatorCodes: ['DLH', 'LOT'],
    },
    {
      id: '26106c8a-aaee-4b84-bb6c-b5af3389e22f',
      airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
      shortName: 'T2',
      fullName: 'Terminal 2',
      averageTaxiTime: 14,
      operatorCodes: ['BAW', 'AFR'],
    },

    // EPWA — Warsaw Chopin
    {
      id: '104014ec-110e-483d-9f3c-8f6909fe4823',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      shortName: 'TA',
      fullName: 'Terminal A',
      averageTaxiTime: 9,
      operatorCodes: ['LOT'],
    },

    // KJFK — New York John F. Kennedy
    {
      id: 'a0d2e8d1-1101-4f01-9101-9c1f4e2a0001',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      shortName: 'T1',
      fullName: 'Terminal 1',
      averageTaxiTime: 18,
      operatorCodes: ['AFR', 'DLH', 'KLM', 'JAL', 'ETD'],
    },
    {
      id: 'a0d2e8d1-1101-4f02-9101-9c1f4e2a0002',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      shortName: 'T4',
      fullName: 'Terminal 4',
      averageTaxiTime: 20,
      operatorCodes: ['DAL', 'VIR', 'KLM', 'AFR', 'KAL'],
    },
    {
      id: 'a0d2e8d1-1101-4f03-9101-9c1f4e2a0003',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      shortName: 'T5',
      fullName: 'Terminal 5',
      averageTaxiTime: 16,
      operatorCodes: ['JBU'],
    },
    {
      id: 'a0d2e8d1-1101-4f04-9101-9c1f4e2a0004',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      shortName: 'T7',
      fullName: 'Terminal 7',
      averageTaxiTime: 17,
      operatorCodes: ['BAW', 'QFA', 'AAL'],
    },
    {
      id: 'a0d2e8d1-1101-4f05-9101-9c1f4e2a0005',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      shortName: 'T8',
      fullName: 'Terminal 8',
      averageTaxiTime: 19,
      operatorCodes: ['AAL', 'JAL', 'BAW'],
    },

    // LFPG — Paris Charles de Gaulle
    {
      id: 'b3e7c20d-2201-4f01-9101-9d2f5e3a0001',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T1',
      fullName: 'Terminal 1',
      averageTaxiTime: 14,
      operatorCodes: ['AAL', 'ANA', 'DLH', 'JAL'],
    },
    {
      id: 'b3e7c20d-2201-4f02-9101-9d2f5e3a0002',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2A',
      fullName: 'Terminal 2A',
      averageTaxiTime: 15,
      operatorCodes: ['AFR', 'BAW'],
    },
    {
      id: 'b3e7c20d-2201-4f03-9101-9d2f5e3a0003',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2B',
      fullName: 'Terminal 2B',
      averageTaxiTime: 15,
      operatorCodes: ['BEL', 'DLH'],
    },
    {
      id: 'b3e7c20d-2201-4f04-9101-9d2f5e3a0004',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2C',
      fullName: 'Terminal 2C',
      averageTaxiTime: 15,
      operatorCodes: ['AFR', 'ANA'],
    },
    {
      id: 'b3e7c20d-2201-4f05-9101-9d2f5e3a0005',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2D',
      fullName: 'Terminal 2D',
      averageTaxiTime: 15,
      operatorCodes: ['KLM', 'AFR'],
    },
    {
      id: 'b3e7c20d-2201-4f06-9101-9d2f5e3a0006',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2E',
      fullName: 'Terminal 2E',
      averageTaxiTime: 16,
      operatorCodes: ['AFR', 'DAL', 'KLM', 'VIR'],
    },
    {
      id: 'b3e7c20d-2201-4f07-9101-9d2f5e3a0007',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2F',
      fullName: 'Terminal 2F',
      averageTaxiTime: 13,
      operatorCodes: ['AFR', 'KLM'],
    },
    {
      id: 'b3e7c20d-2201-4f08-9101-9d2f5e3a0008',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T2G',
      fullName: 'Terminal 2G',
      averageTaxiTime: 12,
      operatorCodes: ['AFR', 'HOP'],
    },
    {
      id: 'b3e7c20d-2201-4f09-9101-9d2f5e3a0009',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      shortName: 'T3',
      fullName: 'Terminal 3',
      averageTaxiTime: 11,
      operatorCodes: ['WZZ', 'RYR'],
    },

    // CYYR — Goose Bay
    {
      id: 'c4f8e9b2-3301-4f01-9101-9e3f6f4a0001',
      airportId: 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae',
      shortName: 'MT',
      fullName: 'Goose Bay Air Terminal Building',
      averageTaxiTime: 6,
      operatorCodes: ['ACA', 'AIE', 'SPR'],
    },

    // BIKF — Reykjavik Keflavik
    {
      id: 'd5a9f0c3-4401-4f01-9101-9f4f7f5a0001',
      airportId: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a',
      shortName: 'LET',
      fullName: 'Leifur Eiriksson Terminal',
      averageTaxiTime: 8,
      operatorCodes: ['ICE', 'FPY'],
    },

    // CYYT — St. John's
    {
      id: 'e6b0a1d4-5501-4f01-9101-9a5f8f6a0001',
      airportId: '6cf1fcd8-d072-46b5-8132-bd885b43dd97',
      shortName: 'ATB',
      fullName: "St. John's Air Terminal Building",
      averageTaxiTime: 7,
      operatorCodes: ['ACA', 'WJA', 'SPR'],
    },

    // KPHL — Philadelphia
    {
      id: 'f7c1b2e5-6601-4f01-9101-9b6f9f7a0001',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'A-East',
      fullName: 'Terminal A-East',
      averageTaxiTime: 14,
      operatorCodes: ['AAL', 'BAW', 'QTR'],
    },
    {
      id: 'f7c1b2e5-6601-4f02-9101-9b6f9f7a0002',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'A-West',
      fullName: 'Terminal A-West',
      averageTaxiTime: 13,
      operatorCodes: ['AAL', 'AFR', 'DLH'],
    },
    {
      id: 'f7c1b2e5-6601-4f03-9101-9b6f9f7a0003',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'B',
      fullName: 'Terminal B',
      averageTaxiTime: 12,
      operatorCodes: ['AAL'],
    },
    {
      id: 'f7c1b2e5-6601-4f04-9101-9b6f9f7a0004',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'C',
      fullName: 'Terminal C',
      averageTaxiTime: 12,
      operatorCodes: ['AAL'],
    },
    {
      id: 'f7c1b2e5-6601-4f05-9101-9b6f9f7a0005',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'D',
      fullName: 'Terminal D',
      averageTaxiTime: 13,
      operatorCodes: ['DAL', 'UAL', 'ACA'],
    },
    {
      id: 'f7c1b2e5-6601-4f06-9101-9b6f9f7a0006',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'E',
      fullName: 'Terminal E',
      averageTaxiTime: 14,
      operatorCodes: ['AAL'],
    },
    {
      id: 'f7c1b2e5-6601-4f07-9101-9b6f9f7a0007',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      shortName: 'F',
      fullName: 'Terminal F',
      averageTaxiTime: 11,
      operatorCodes: ['AAL'],
    },

    // KBOS — Boston Logan
    {
      id: '08d2c3f6-7701-4f01-9101-9c7faf8a0001',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      shortName: 'A',
      fullName: 'Terminal A',
      averageTaxiTime: 13,
      operatorCodes: ['DAL', 'WJA'],
    },
    {
      id: '08d2c3f6-7701-4f02-9101-9c7faf8a0002',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      shortName: 'B',
      fullName: 'Terminal B',
      averageTaxiTime: 14,
      operatorCodes: ['AAL', 'UAL'],
    },
    {
      id: '08d2c3f6-7701-4f03-9101-9c7faf8a0003',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      shortName: 'C',
      fullName: 'Terminal C',
      averageTaxiTime: 14,
      operatorCodes: ['JBU'],
    },
    {
      id: '08d2c3f6-7701-4f04-9101-9c7faf8a0004',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      shortName: 'E',
      fullName: 'Terminal E',
      averageTaxiTime: 16,
      operatorCodes: ['BAW', 'VIR', 'DLH', 'AFR'],
    },

    // EDDW — Bremen
    {
      id: '19e3d4a7-8801-4f01-9101-9d8fbf9a0001',
      airportId: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf',
      shortName: 'HT',
      fullName: 'Bremen Hauptterminal',
      averageTaxiTime: 5,
      operatorCodes: ['DLH', 'RYR'],
    },
  ];

  const prisma = new PrismaService();

  await prisma.terminal.createMany({ data: terminals });
}
