import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { UserRole } from './user-role';

export class User {
  @ApiProperty({
    description: 'User unique system identifier',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  id!: string;

  @ApiProperty({
    description: 'User first and last name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'User e-mail address',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Role will determine what actions user performs in the system',
    example: 'Pilot',
    enum: UserRole,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Pilot license ID (only for CabinCrew, format: XX-12345)',
    example: 'UK-12345',
    type: 'string',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z]{2}-\d{5}$/, {
    message: 'Pilot license ID does not match the required format.',
  })
  pilotLicenseId?: string | null;

  @ApiProperty({
    description: 'Password user will sign in with',
    example: 'tmU3GSfANn5IuRd64',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    description: 'Simbrief userId',
    example: '123456',
    type: 'string',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  simbriefUserId?: string | null = null;

  @ApiProperty({
    description: 'Current flight user checked in for',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
    type: 'string',
    nullable: true,
  })
  currentFlightId!: string | null;

  @ApiProperty({
    description: 'Current rotation user is performing',
    example: '8f525809-9b37-4c2c-80c8-72be06023fd4',
    type: 'string',
    nullable: true,
  })
  currentRotationId!: string | null;

  @ApiProperty({
    description: 'Home base airport of the pilot (required for CabinCrew)',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    type: 'string',
    nullable: true,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  homeAirportId?: string | null;

  @ApiProperty({
    description: 'Airport where the pilot most recently landed',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    type: 'string',
    nullable: true,
  })
  lastAirportId!: string | null;

  @ApiProperty({
    description: 'Timestamp when the last airport was recorded',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
    nullable: true,
  })
  lastAirportUpdatedAt!: Date | null;
}
