import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FlightSubscriptionDto {
  @ApiProperty({
    description: 'Flight unique identifier to subscribe to',
    example: '3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05',
    format: 'uuid',
  })
  @IsUUID('4')
  flightId!: string;
}
