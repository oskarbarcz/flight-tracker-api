import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
} from 'class-validator';
import { WeatherSource } from '../../../../airports/model/airport-weather.model';

export class UpdateOwnProfileDto {
  @ApiProperty({
    description: 'User first and last name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

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
    description: 'Home base airport of the pilot (only for CabinCrew)',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    type: 'string',
    required: false,
  })
  @ValidateIf(
    (profile: UpdateOwnProfileDto) => profile.homeAirportId !== undefined,
  )
  @IsUUID()
  homeAirportId?: string;

  @ApiProperty({
    description:
      'Simbrief userId. Verified against SimBrief before it is stored, and rejected when SimBrief does not know it.',
    example: '123456',
    type: 'string',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'Simbrief user ID must be a number.',
  })
  simbriefUserId?: string | null;

  @ApiProperty({
    description:
      'Weather provider to read airport weather from when no source is requested explicitly',
    example: WeatherSource.SayIntentions,
    enum: WeatherSource,
    required: false,
  })
  @IsEnum(WeatherSource)
  @IsOptional()
  defaultWeatherSource?: WeatherSource;
}
