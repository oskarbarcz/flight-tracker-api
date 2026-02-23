import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FlightCrew {
  @ApiProperty({
    description: 'Pilots in command of a flight during takeoff and landing',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  pilots!: number;

  @ApiProperty({
    description: 'Relief pilots taking care of the aircraft in cruise',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  reliefPilots!: number;

  @ApiProperty({
    description: 'Cabin crew members serving passengers during the flight',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  cabinCrew!: number;
}

export class Loadsheet {
  @ApiProperty({
    description: 'Time when the aircraft lands',
    type: () => FlightCrew,
  })
  @IsNotEmpty()
  @Type(() => FlightCrew)
  flightCrew!: FlightCrew;

  @ApiProperty({
    description: 'Number of passengers on board excluding flight crew',
    example: 200,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  passengers!: number;

  @ApiProperty({
    description: 'Cargo in tons',
    example: 3.5,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  cargo!: number;

  @ApiProperty({
    description: 'Aircraft payload in tons',
    example: 22.507,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  payload!: number;

  @ApiProperty({
    description: 'Zero fuel weight of the aircraft in tons',
    example: 189.507,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  zeroFuelWeight!: number;

  @ApiProperty({
    description: 'Fuel on board in tons',
    example: 11.5,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  blockFuel!: number;
}

export class Loadsheets {
  @ApiProperty({
    description: 'Loadsheet filled by operations team for pilots',
    type: Loadsheet,
    nullable: true,
  })
  @Type(() => Loadsheet)
  preliminary!: Loadsheet | null;

  @ApiProperty({
    description: 'Loadsheet filled by pilots when finished boarding',
    type: Loadsheet,
    nullable: true,
  })
  @Type(() => Loadsheet)
  final!: Loadsheet | null;
}
