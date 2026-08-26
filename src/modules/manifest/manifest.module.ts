import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { GetFlightManifestAction } from './infra/http/action/get-flight-manifest.action';
import { GetFlightCargoManifestAction } from './infra/http/action/get-flight-cargo-manifest.action';
import { GetFlightNotocAction } from './infra/http/action/get-flight-notoc.action';
import { GetHoldLayoutAction } from './infra/http/action/get-hold-layout.action';
import { ListHoldLayoutsAction } from './infra/http/action/list-hold-layouts.action';
import { GenerateFlightManifestHandler } from './application/command/generate-flight-manifest.command';
import { ReconcileFlightManifestHandler } from './application/command/reconcile-flight-manifest.command';
import { GenerateFlightCargoManifestHandler } from './application/command/generate-flight-cargo-manifest.command';
import { ReconcileFlightCargoManifestHandler } from './application/command/reconcile-flight-cargo-manifest.command';
import { IssueNotocHandler } from './application/command/issue-notoc.command';
import { AcknowledgeNotocHandler } from './application/command/acknowledge-notoc.command';
import { GetFlightManifestHandler } from './application/query/get-flight-manifest.query';
import { GetPassengerLocaleHandler } from './application/query/get-passenger-locale.query';
import { GetSeatCapacityHandler } from './application/query/get-seat-capacity.query';
import { GetFlightCargoManifestHandler } from './application/query/get-flight-cargo-manifest.query';
import { GetFlightCargoLoadHandler } from './application/query/get-flight-cargo-load.query';
import { GetHoldLayoutHandler } from './application/query/get-hold-layout.query';
import { ListHoldLayoutsHandler } from './application/query/list-hold-layouts.query';
import { GetFlightNotocHandler } from './application/query/get-flight-notoc.query';
import { FlightsWithNotocHandler } from './application/query/has-flight-notoc.query';
import { GetNotifiableLoadSummaryHandler } from './application/query/get-notifiable-load-summary.query';
import { AssertHoldVariantOfferedHandler } from './application/assert/assert-hold-variant-offered.query';
import { GenerateManifestsListener } from './application/event/external/generate-manifests.listener';
import { PassengersRepository } from './infra/database/repository/passengers.repository';
import { CargoRepository } from './infra/database/repository/cargo.repository';
import { NotocRepository } from './infra/database/repository/notoc.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    GetFlightManifestAction,
    GetFlightCargoManifestAction,
    GetFlightNotocAction,
    ListHoldLayoutsAction,
    GetHoldLayoutAction,
  ],
  providers: [
    PassengersRepository,
    CargoRepository,
    NotocRepository,
    GenerateFlightManifestHandler,
    ReconcileFlightManifestHandler,
    GenerateFlightCargoManifestHandler,
    ReconcileFlightCargoManifestHandler,
    IssueNotocHandler,
    AcknowledgeNotocHandler,
    GetFlightManifestHandler,
    GetPassengerLocaleHandler,
    GetSeatCapacityHandler,
    GetFlightCargoManifestHandler,
    GetFlightCargoLoadHandler,
    GetHoldLayoutHandler,
    ListHoldLayoutsHandler,
    GetFlightNotocHandler,
    FlightsWithNotocHandler,
    GetNotifiableLoadSummaryHandler,
    AssertHoldVariantOfferedHandler,
    GenerateManifestsListener,
  ],
})
export class ManifestModule {}
