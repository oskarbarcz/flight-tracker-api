import { Module } from '@nestjs/common';
import { RotationsService } from './rotations.service';
import { RotationsController } from './rotations.controller';
import { RotationsRepository } from './rotations.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RotationsController],
  providers: [RotationsService, RotationsRepository],
  exports: [RotationsService],
})
export class RotationsModule {}
