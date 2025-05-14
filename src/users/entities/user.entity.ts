import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class User {
  @ApiProperty({
    description: 'User unique system identifier',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  id: string;

  @ApiProperty({
    description: 'User first and last name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User e-mail address',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role will determine what actions user performs in the system',
    example: 'Pilot',
    enum: UserRole,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Password user will sign in with',
    example: 'tmU3GSfANn5IuRd64',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Current flight user is assigned to',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  currentFlightId: string | null;

  @ApiProperty({
    description: 'Current rotation user is assigned to',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  currentRotationId: string | null;
}
