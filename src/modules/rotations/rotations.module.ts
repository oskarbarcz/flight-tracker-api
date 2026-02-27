import { Module } from '@nestjs/common';
import { LegacyRotationsController } from './controller/rotations.controller';
import { LegacyRotationsRepository } from './repository/rotations.repository';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LegacyRotationsController],
  providers: [LegacyRotationsRepository],
})
export class RotationsModule {}
