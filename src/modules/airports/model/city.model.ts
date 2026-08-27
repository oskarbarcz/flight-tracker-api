import { ApiProperty } from '@nestjs/swagger';

export class CityRef {
  @ApiProperty({
    description: 'City unique system identifier',
    example: '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63',
  })
  id!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Frankfurt',
  })
  name!: string;
}
