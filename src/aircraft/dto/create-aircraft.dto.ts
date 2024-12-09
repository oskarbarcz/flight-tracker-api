import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAircraftDto {
  @IsString()
  @Length(4, 4, {
    message: 'ICAO aircraft code must be exactly 4 characters long.',
  })
  @IsNotEmpty()
  icaoCode: string;

  @IsString()
  @IsNotEmpty()
  shortName: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  registration: string;

  @IsString()
  @IsNotEmpty()
  selcal: string;

  @IsString()
  @IsNotEmpty()
  livery: string;
}
