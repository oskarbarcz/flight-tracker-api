import { Module } from '@nestjs/common';
import { RotationsController } from './controller/rotations.controller';
import { RotationsRepository } from './repository/rotations.repository';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RotationsController],
  providers: [RotationsRepository],
})
export class RotationsModule {}
