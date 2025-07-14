import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Operator } from '../../operators/entity/operator.entity';

export class Aircraft {
  @ApiProperty({
    description: 'Aircraft unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id: string;

  @ApiProperty({
    description: 'Aircraft type ICAO code',
    example: 'B77W',
  })
  @IsString()
  @IsNotEmpty()
  icaoCode: string;

  @ApiProperty({
    description: 'Aircraft short name',
    example: 'Boeing 777',
  })
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiProperty({
    description:
      'Aircraft name containing manufacturer and some configuration options',
    example: 'Boeing 777-300ER Rolls-Royce',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Aircraft registration matching act of registration',
    example: 'D-AIMC',
  })
  @IsString()
  @IsNotEmpty()
  registration: string;

  @ApiProperty({
    description: 'Aircraft SELCAL code',
    example: 'KR-QL',
  })
  @IsString()
  @IsNotEmpty()
  selcal: string;

  @ApiProperty({
    description: 'Aircraft livery description and age',
    example: 'Boeing House (2024)',
  })
  @IsString()
  @IsNotEmpty()
  livery: string;

  @ApiProperty({
    description: 'Aircraft operator',
  })
  @IsString()
  @IsNotEmpty()
  operatorId: string;

  @ApiProperty({
    description: 'Aircraft operator',
    type: Operator,
  })
  operator: Operator | null;
}
