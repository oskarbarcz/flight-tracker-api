import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DelayReport } from '../../../model/delay-report.model';
import {
  DelayRequest,
  DelayRequestStatus,
} from '../../../model/delay-request.model';

export class DelayRequestListFilters {
  @IsOptional()
  @IsEnum(DelayRequestStatus)
  status?: DelayRequestStatus;
}

export class ReportDelayRequest extends PickType(DelayReport, [
  'delayMinutes',
  'reasonCode',
  'freeText',
]) {}

export class RejectDelayReportRequest {
  @ApiProperty({
    description: 'Reason Operations gives for rejecting the report.',
    example: 'Wrong code — this was a ramp delay, not ATC.',
  })
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}

export class GetDelayReportResponse extends PickType(DelayReport, [
  'id',
  'delayMinutes',
  'reasonCode',
  'freeText',
  'status',
  'reportedBy',
  'decidedBy',
  'rejectionReason',
  'decidedAt',
  'createdAt',
]) {}

export class GetDelayRequestResponse extends PickType(DelayRequest, [
  'id',
  'flightId',
  'totalDelayMinutes',
  'allocatedMinutes',
  'isReconciled',
  'isSettled',
  'reports',
  'createdAt',
]) {}
