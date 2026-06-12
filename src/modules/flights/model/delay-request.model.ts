import { ApiProperty } from '@nestjs/swagger';
import { DelayReport } from './delay-report.model';

export enum DelayRequestStatus {
  Pending = 'pending',
  Settled = 'settled',
}

export class DelayRequest {
  @ApiProperty({
    description: 'Delay allocation request unique system identifier.',
    example: 'a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a',
  })
  id!: string;

  @ApiProperty({
    description: 'Flight this delay allocation request belongs to.',
    example: '2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d',
  })
  flightId!: string;

  @ApiProperty({
    description:
      'Total departure delay to be allocated, in minutes. Computed from the off-block report and frozen at creation.',
    example: 10,
  })
  totalDelayMinutes!: number;

  @ApiProperty({
    description:
      'Sum of the minutes across all reports. Derived. Compare against `totalDelayMinutes` to see what is still unallocated.',
    example: 6,
  })
  allocatedMinutes!: number;

  @ApiProperty({
    description:
      'True when the reports allocate exactly the total delay (`allocatedMinutes === totalDelayMinutes`).',
    example: false,
  })
  isReconciled!: boolean;

  @ApiProperty({
    description:
      'True when the request is fully settled: at least one report, every report accepted, and the minutes fully allocated. The flight can only be closed once this is true.',
    example: false,
  })
  isSettled!: boolean;

  @ApiProperty({
    description: 'Coded delay reports filed against this request.',
    type: DelayReport,
    isArray: true,
  })
  reports!: DelayReport[];

  @ApiProperty({
    description: 'Server-recorded time the request was created.',
    example: '2026-06-12T12:00:00.000Z',
  })
  createdAt!: Date;
}
