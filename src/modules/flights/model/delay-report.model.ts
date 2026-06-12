import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DelayReportStatus } from 'prisma/client/client';
import { DelayReasonCode } from './delay-reason-code.model';

export { DelayReportStatus };

export class DelayParticipant {
  @ApiProperty({
    description: 'User unique system identifier.',
    example: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
  })
  id!: string;

  @ApiProperty({
    description: 'User first and last name.',
    example: 'Rick Doe',
  })
  name!: string;
}

export class DelayReport {
  @ApiProperty({
    description: 'Delay allocation report unique system identifier.',
    example: 'a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a',
  })
  id!: string;

  @ApiProperty({
    description: 'Number of delay minutes attributed to this reason.',
    example: 6,
  })
  @IsInt()
  @Min(1)
  delayMinutes!: number;

  @ApiProperty({
    description:
      'Coded reason for this portion of the delay. Three-letter operator delay code.',
    example: DelayReasonCode.LoadingError,
    enum: DelayReasonCode,
  })
  @IsEnum(DelayReasonCode)
  @IsNotEmpty()
  reasonCode!: DelayReasonCode;

  @ApiProperty({
    description: 'Optional free-text note added by the cabin crew.',
    example: 'Catering truck arrived late to stand.',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  freeText?: string | null = null;

  @ApiProperty({
    description:
      'Decision state of this report. `pending` until Operations decides; `accepted` once accepted; `rejected` when sent back to the cabin crew.',
    example: DelayReportStatus.pending,
    enum: DelayReportStatus,
  })
  status!: DelayReportStatus;

  @ApiProperty({
    description: 'Cabin-crew member who filed this report.',
    type: DelayParticipant,
  })
  reportedBy!: DelayParticipant;

  @ApiProperty({
    description:
      'Operations member who accepted or rejected this report. `null` while still pending.',
    type: DelayParticipant,
    nullable: true,
  })
  decidedBy!: DelayParticipant | null;

  @ApiProperty({
    description:
      'Reason Operations gave when rejecting this report. `null` unless rejected.',
    example: 'Wrong code — this was a ramp delay, not ATC.',
    nullable: true,
  })
  rejectionReason!: string | null;

  @ApiProperty({
    description:
      'Time the report was accepted or rejected. `null` while still pending.',
    example: '2026-06-12T12:45:00.000Z',
    nullable: true,
  })
  decidedAt!: Date | null;

  @ApiProperty({
    description: 'Server-recorded time the report was filed.',
    example: '2026-06-12T12:30:00.000Z',
  })
  createdAt!: Date;
}
