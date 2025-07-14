import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class Schedule {
  @ApiProperty({
    description: 'Time when the aircraft lands',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  arrivalTime: Date | null;

  @ApiProperty({
    description: 'Time when aircraft parks at the gate',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  onBlockTime: Date | null;

  @ApiProperty({
    description: 'Time when the aircraft takes off',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  takeoffTime: Date | null;

  @ApiProperty({
    description: 'Time when the aircraft leaves the gate',
    type: Date,
    example: '2021-07-01T12:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  offBlockTime: Date | null;
}

export class ScheduledTimesheet {
  @ApiProperty({
    description: 'Flight plan timesheet reported to air traffic services',
    type: Schedule,
  })
  @IsNotEmpty()
  scheduled: Schedule;
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
}
