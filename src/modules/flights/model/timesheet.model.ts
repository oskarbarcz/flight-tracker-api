import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class Schedule {
  @ApiProperty({
    description: 'Time when the aircraft lands',
    example: '2021-07-01T12:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  arrivalTime!: Date | null;

  @ApiProperty({
    description: 'Time when aircraft parks at the gates',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  onBlockTime!: Date | null;

  @ApiProperty({
    description: 'Time when the aircraft takes off',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  takeoffTime!: Date | null;

  @ApiProperty({
    description: 'Time when the aircraft leaves the gates',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  offBlockTime!: Date | null;
}

type NonNullable<T> = T extends null | undefined ? never : T;

export type FilledSchedule = {
  [K in keyof Schedule]: NonNullable<Schedule[K]>;
};

export class ScheduledTimesheet {
  @ApiProperty({
    description: 'Flight plan timesheet reported to air traffic services',
    type: Schedule,
  })
  @IsNotEmpty()
  scheduled!: Schedule;
}

export class EstimatedTimesheet extends ScheduledTimesheet {
  @ApiProperty({
    description: 'Flight plan timesheet with values estimated by the crew',
    type: Schedule,
  })
  estimated?: Schedule;
}

export class FullTimesheet extends PartialType(EstimatedTimesheet) {
  @ApiProperty({
    description: 'Actual timesheet completed by the crew during the flight',
    type: Schedule,
  })
  actual?: Partial<Schedule>;

  @ApiProperty({
    description:
      'Predicted timesheet reported by the crew based on FMC readouts or ATC advisories',
    type: Schedule,
    required: false,
  })
  predicted?: Partial<Schedule>;
}

export type FilledTimesheet = {
  [K in keyof FullTimesheet]: NonNullable<FullTimesheet[K]>;
};

export type SchedulePatch = {
  [K in keyof Schedule]?: Date | null;
};

const scheduleKeys: ReadonlyArray<keyof Schedule> = [
  'offBlockTime',
  'takeoffTime',
  'arrivalTime',
  'onBlockTime',
];

export const mergeSchedulePatch = (
  current: Partial<Schedule> | undefined,
  patch: SchedulePatch,
): Partial<Schedule> => {
  const result: Partial<Schedule> = { ...current };
  for (const key of scheduleKeys) {
    const value = patch[key];
    if (value === undefined) continue;
    if (value === null) {
      delete result[key];
    } else {
      result[key] = value;
    }
  }
  return result;
};
