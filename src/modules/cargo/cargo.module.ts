import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { ListHoldLayoutsAction } from './infra/http/action/list-hold-layouts.action';
import { GetHoldLayoutAction } from './infra/http/action/get-hold-layout.action';
import { GetFlightCargoManifestAction } from './infra/http/action/get-flight-cargo-manifest.action';
import { ListHoldLayoutsHandler } from './application/query/list-hold-layouts.query';
import { GetHoldLayoutHandler } from './application/query/get-hold-layout.query';
import { AssertHoldVariantOfferedHandler } from './application/assert/assert-hold-variant-offered.query';
import { GenerateFlightCargoManifestHandler } from './application/command/generate-flight-cargo-manifest.command';
import { ReconcileFlightCargoManifestHandler } from './application/command/reconcile-flight-cargo-manifest.command';
import { GetFlightCargoManifestHandler } from './application/query/get-flight-cargo-manifest.query';
import { GetFlightCargoLoadHandler } from './application/query/get-flight-cargo-load.query';
import { CargoRepository } from './infra/database/repository/cargo.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    ListHoldLayoutsAction,
    GetHoldLayoutAction,
    GetFlightCargoManifestAction,
  ],
  providers: [
    CargoRepository,
    ListHoldLayoutsHandler,
    GetHoldLayoutHandler,
    AssertHoldVariantOfferedHandler,
    GenerateFlightCargoManifestHandler,
    ReconcileFlightCargoManifestHandler,
    GetFlightCargoManifestHandler,
    GetFlightCargoLoadHandler,
  ],
})
export class CargoModule {}
