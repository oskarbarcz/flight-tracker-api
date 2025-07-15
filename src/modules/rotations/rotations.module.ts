import { Module } from '@nestjs/common';
import { RotationsService } from './service/rotations.service';
import { RotationsController } from './controller/rotations.controller';
import { RotationsRepository } from './repository/rotations.repository';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RotationsController],
  providers: [RotationsService, RotationsRepository],
  exports: [RotationsService],
})
export class RotationsModule {}
