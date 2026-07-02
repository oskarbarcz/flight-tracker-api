import { Aircraft, AircraftState } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

export async function loadAircraft(): Promise<void> {
  const a330: Aircraft = {
    id: '9f5da1a4-f09e-4961-8299-82d688337d1f',
    type: 'A339',
    registration: 'D-AIMC',
    selcal: 'LR-CK',
    livery: 'Fanhansa (2024)',
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa
    currentState: AircraftState.planned, // LH450 Created
    baseAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    lastParkingPositionId: null,
  };

  const a321: Aircraft = {
    id: '7d27a031-5abb-415f-bde5-1aa563ad394e',
    type: 'A321',
    registration: 'D-AIDA',
    selcal: 'SK-PK',
    livery: 'Sunshine (2024)',
    operatorId: '5c649579-22eb-4c07-a96c-b74a77f53871', // Condor
    currentState: AircraftState.idle,
    baseAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportUpdatedAt: new Date('2025-01-02 18:00'),
    lastParkingPositionId: null,
  };

  const a319: Aircraft = {
    id: '3f34bc59-c9c3-4ad0-88fa-2cc570298602',
    type: 'A319',
    registration: 'D-AIDK',
    selcal: 'MS-KL',
    livery: 'Water (2024)',
    operatorId: '5c649579-22eb-4c07-a96c-b74a77f53871', // Condor
    currentState: AircraftState.idle,
    baseAirportId: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf', // EDDW
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    lastParkingPositionId: null,
  };

  const b773: Aircraft = {
    id: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98',
    type: 'B77W',
    registration: 'N78881',
    selcal: 'KY-JO',
    livery: 'Team USA (2023)',
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    currentState: AircraftState.cruise, // AA4913 TaxiingIn
    baseAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportUpdatedAt: new Date('2025-01-01 08:00'),
    lastParkingPositionId: null,
  };

  // One dedicated aircraft per flight fixture, so each flight-status fixture
  // owns its movement/reposition history instead of sharing a330/b773.
  // lastAirportId reflects where the aircraft actually is given its flight's
  // progress: destination once it has reported on-block, departure once the
  // pilot has checked in (after the deadhead to it), otherwise the base.
  const AAL = '1f630d38-ad24-47cc-950b-3783e71bbd10'; // American Airlines
  const DLH = '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d'; // Lufthansa
  const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
  const KBOS = 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3';
  const KPHL = 'e764251b-bb25-4e8b-8cc7-11b0397b4554';
  const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
  const atBase = new Date('2025-01-01 08:00');
  const atCheckIn = new Date('2025-01-01 12:00');
  const aalOnBlock = new Date('2025-01-01 16:18');
  const onBlock = new Date('2025-01-01 16:28');
  const dlh40OnBlock = new Date('2025-01-02 02:45');

  const mk = (
    id: string,
    type: string,
    registration: string,
    selcal: string,
    livery: string,
    operatorId: string,
    baseAirportId: string,
    lastAirportId: string,
    lastAirportUpdatedAt: Date,
    currentState: AircraftState,
    lastParkingPositionId: string | null = null,
  ): Aircraft => ({
    id,
    type,
    registration,
    selcal,
    livery,
    operatorId,
    currentState,
    baseAirportId,
    lastAirportId,
    lastAirportUpdatedAt,
    lastParkingPositionId,
  });

  const fleet: Aircraft[] = [
    // American — B77W, based KJFK (deadhead KJFK -> KBOS on every checked-in leg)
    mk(
      '6c48d613-6582-49de-afbb-89fdc7cac0b7',
      'B77W',
      'N718AN',
      'AB-CD',
      'Oneworld (2023)',
      AAL,
      KJFK,
      KPHL,
      aalOnBlock,
      AircraftState.idle,
    ), // AAL4905 Closed
    mk(
      'ed247c36-58f0-43ff-81fd-ffae548a73e2',
      'B77W',
      'N719AN',
      'AB-CE',
      'Flagship (2022)',
      AAL,
      KJFK,
      KJFK,
      atBase,
      AircraftState.planned,
    ), // AAL4907 Created
    mk(
      'e7c6c5e3-84ff-4c5b-a40c-79f178c5b379',
      'B77W',
      'N720AN',
      'AB-CF',
      'Astrojet (2021)',
      AAL,
      KJFK,
      KBOS,
      atCheckIn,
      AircraftState.checked_in,
    ), // AAL4908 CheckedIn
    mk(
      'a2f425e0-2db0-4d8f-8c4c-b3a95d51eb24',
      'B77W',
      'N721AN',
      'AB-CG',
      'Polished (2019)',
      AAL,
      KJFK,
      KBOS,
      atCheckIn,
      AircraftState.checked_in,
    ), // AAL4909 BoardingStarted
    mk(
      'ffe14007-9147-40a1-a228-573c9c87a2e7',
      'B77W',
      'N722AN',
      'AB-DE',
      'Standard (2020)',
      AAL,
      KJFK,
      KBOS,
      atCheckIn,
      AircraftState.checked_in,
    ), // AAL4910 BoardingFinished
    mk(
      '0fad1757-d650-4a52-b047-f29e9ea5c067',
      'B77W',
      'N723AN',
      'AB-DF',
      'AAdvantage (2022)',
      AAL,
      KJFK,
      KBOS,
      atCheckIn,
      AircraftState.cruise,
    ), // AAL4911 TaxiingOut
    mk(
      '8694eb6d-83e4-4f24-8a72-b67523b4d6bf',
      'B77W',
      'N724AN',
      'AB-DG',
      'Heritage TWA (2019)',
      AAL,
      KJFK,
      KBOS,
      atCheckIn,
      AircraftState.cruise,
    ), // AAL4912 InCruise
    mk(
      '3c3f3402-cdb1-4716-9e02-1fe3df12e0e4',
      'B77W',
      'N725AN',
      'AB-EF',
      'Heritage US Airways (2020)',
      AAL,
      KJFK,
      KPHL,
      onBlock,
      AircraftState.idle,
    ), // AAL4914 OnBlock
    mk(
      '8f27ca75-01e0-4a3f-bcf2-f838e02b9af9',
      'B77W',
      'N726AN',
      'AB-EG',
      'Heritage Reno Air (2021)',
      AAL,
      KJFK,
      KPHL,
      onBlock,
      AircraftState.idle,
    ), // AAL4915 OffboardingStarted
    mk(
      '69811511-fa34-4837-ab5d-dd480aeab8b6',
      'B77W',
      'N727AN',
      'AB-FG',
      'Heritage America West (2022)',
      AAL,
      KJFK,
      KPHL,
      onBlock,
      AircraftState.idle,
    ), // AAL4916 OffboardingFinished
    mk(
      '30a0d850-5440-436d-95a2-fa8fdc79f715',
      'B77W',
      'N728AN',
      'AC-DE',
      'Stand Up To Cancer (2023)',
      AAL,
      KJFK,
      KPHL,
      onBlock,
      AircraftState.idle,
    ), // AAL4917 Closed
    mk(
      '7e059d96-260c-44e3-a08c-a216cb76398b',
      'B77W',
      'N729AN',
      'AC-DF',
      'Breast Cancer Awareness (2022)',
      AAL,
      KJFK,
      KPHL,
      onBlock,
      AircraftState.idle,
    ), // AAL4918 OffboardingFinished
    mk(
      'b0ea1829-61ea-4b50-8bf6-bfccfb4fe5c7',
      'B77W',
      'N730AN',
      'AC-DG',
      '50th Anniversary (2024)',
      AAL,
      KJFK,
      KPHL,
      onBlock,
      AircraftState.idle,
    ), // AAL4919 OffboardingFinished
    // Lufthansa — A339, based EDDF (deadhead only on KJFK-origin return legs)
    mk(
      'b84e4c67-7565-4846-84c4-ab8215308fbd',
      'A339',
      'D-AIMD',
      'BD-EF',
      'Star Alliance (2023)',
      DLH,
      EDDF,
      KJFK,
      dlh40OnBlock,
      AircraftState.idle,
      'e74b3184-4bdd-4055-b8ce-62d7d95df0fb', // KJFK T1 gate "B22" parking position
    ), // DLH40 Closed (EDDF->KJFK)
    mk(
      'becc1596-dfa0-452b-81ec-3f1f2fa0dce2',
      'A339',
      'D-AIME',
      'BD-EG',
      'Lovehansa (2024)',
      DLH,
      EDDF,
      EDDF,
      atBase,
      AircraftState.planned,
      'ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9', // EDDF T1 gate "A10" parking position
    ), // DLH41 Created
    mk(
      'a9b9205d-53b1-4eec-bb24-548a12159997',
      'A339',
      'D-AIMF',
      'BD-FG',
      'New Livery (2018)',
      DLH,
      EDDF,
      EDDF,
      onBlock,
      AircraftState.idle,
    ), // DLH43 OffboardingFinished (KJFK->EDDF)
    mk(
      'ed7ed4bb-95ff-4e79-9331-11212ef727ec',
      'A339',
      'D-AIMG',
      'BE-FG',
      'Retro 1970s (2022)',
      DLH,
      EDDF,
      KJFK,
      atCheckIn,
      AircraftState.cruise,
    ), // DLH102 InCruise (KJFK->EDDF)
    mk(
      '5637d186-d9e4-45e4-9940-ae6f6552c9ae',
      'A339',
      'D-AIMH',
      'CD-EF',
      'Siegerflieger (2023)',
      DLH,
      EDDF,
      EDDF,
      atBase,
      AircraftState.cruise,
    ), // DLH103 TaxiingIn (EDDF->KJFK)
    mk(
      '785bdfda-291a-4c11-a5d9-b57b5c0b8e5e',
      'A339',
      'D-AIMK',
      'CD-EG',
      'Cheers to 70 Years (2025)',
      DLH,
      EDDF,
      EDDF,
      atBase,
      AircraftState.planned,
    ), // DLH81 Ready
    mk(
      'cfedcfae-6e80-4801-8a89-12b2430c908b',
      'A339',
      'D-AIML',
      'CE-FG',
      'Munich (2024)',
      DLH,
      EDDF,
      EDDF,
      atBase,
      AircraftState.cruise,
    ), // DLH880 InCruise (EDDF->CDG)
  ];

  const prisma = new PrismaService();
  for (const aircraft of [a330, a321, a319, b773, ...fleet]) {
    await prisma.aircraft.create({ data: aircraft });
  }
}
