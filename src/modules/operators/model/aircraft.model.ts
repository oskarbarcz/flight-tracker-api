import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Airframe } from '../../airframes/model/airframe.model';

export enum AircraftState {
  Idle = 'idle',
  Planned = 'planned',
  CheckedIn = 'checked_in',
  Cruise = 'cruise',
}

export class Aircraft {
  @ApiProperty({
    description: 'Aircraft unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id!: string;

  @ApiProperty({
    description: 'Airframe that describes this aircraft type',
    type: Airframe,
  })
  airframe!: Airframe;

  @ApiProperty({
    description: 'Aircraft registration matching act of registration',
    example: 'D-AIMC',
  })
  @IsString()
  @IsNotEmpty()
  registration!: string;

  @ApiProperty({
    description: 'Aircraft SELCAL code',
    example: 'KR-QL',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  selcal!: string | null;

  @ApiProperty({
    description: 'Aircraft livery description and age',
    example: 'Boeing House (2024)',
  })
  @IsString()
  @IsNotEmpty()
  livery!: string;
}
