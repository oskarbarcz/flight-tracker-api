import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { PassengersRepository } from './infra/database/repository/passengers.repository';
import { GenerateFlightManifestHandler } from './application/command/generate-flight-manifest.command';
import { GetFlightManifestHandler } from './application/query/get-flight-manifest.query';
import { ReconcileFlightManifestHandler } from './application/command/reconcile-flight-manifest.command';
import { GetPassengerLocaleHandler } from './application/query/get-passenger-locale.query';
import { GetSeatCapacityHandler } from './application/query/get-seat-capacity.query';
import { GetFlightManifestAction } from './infra/http/action/get-flight-manifest.action';

@Module({
  imports: [PrismaModule],
  controllers: [GetFlightManifestAction],
  providers: [
    PassengersRepository,
    GenerateFlightManifestHandler,
    ReconcileFlightManifestHandler,
    GetFlightManifestHandler,
    GetPassengerLocaleHandler,
    GetSeatCapacityHandler,
  ],
})
export class PassengersModule {}
