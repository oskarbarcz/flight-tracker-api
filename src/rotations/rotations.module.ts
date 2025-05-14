import { Module } from '@nestjs/common';
import { RotationsService } from './rotations.service';
import { RotationsController } from './rotations.controller';
import { RotationsRepository } from './rotations.repository';
import { FlightsModule } from '../flights/flights.module';

@Module({
  imports: [FlightsModule],
  controllers: [RotationsController],
  providers: [RotationsService, RotationsRepository],
  exports: [RotationsService],
})
export class RotationsModule {}
