import { ApiProperty } from '@nestjs/swagger';
import { CrewRole } from 'prisma/client/client';

export { CrewRole };

export class Crew {
  @ApiProperty({
    description: 'Crew member unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id!: string;

  @ApiProperty({
    description: 'Crew member full name',
    example: 'Virgil Rivers',
  })
  name!: string;

  @ApiProperty({
    description: 'Crew member email address',
    example: 'virgil.rivers@lufthansa.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Operator unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  operatorId!: string;

  @ApiProperty({
    description: 'Crew member role',
    enum: CrewRole,
    example: CrewRole.fo,
  })
  role!: CrewRole;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt!: Date;
}
