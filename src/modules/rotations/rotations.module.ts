import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { RotationsRepository } from './infra/database/repository/rotations.repository';
import { CreateRotationHandler } from './application/command/create-rotation.command';
import { EditRotationHandler } from './application/command/edit-rotation.command';
import { RemoveRotationHandler } from './application/command/remove-rotation.command';
import { AddLegHandler } from './application/command/add-leg.command';
import { UpdateLegHandler } from './application/command/update-leg.command';
import { RemoveLegHandler } from './application/command/remove-leg.command';
import { MarkRotationReadyHandler } from './application/command/mark-rotation-ready.command';
import { AttachFlightToLegHandler } from './application/command/attach-flight-to-leg.command';
import { DetachFlightFromLegHandler } from './application/command/detach-flight-from-leg.command';
import { GetRotationByIdHandler } from './application/query/get-rotation-by-id.query';
import { ListRotationsHandler } from './application/query/list-rotations.query';
import { FlightLifecycleListener } from './application/event/external/flight-lifecycle.listener';
import { CreateRotationAction } from './infra/http/action/create-rotation.action';
import { EditRotationAction } from './infra/http/action/edit-rotation.action';
import { RemoveRotationAction } from './infra/http/action/remove-rotation.action';
import { ListRotationsAction } from './infra/http/action/list-rotations.action';
import { GetRotationAction } from './infra/http/action/get-rotation.action';
import { AddLegAction } from './infra/http/action/add-leg.action';
import { UpdateLegAction } from './infra/http/action/update-leg.action';
import { RemoveLegAction } from './infra/http/action/remove-leg.action';
import { MarkRotationReadyAction } from './infra/http/action/mark-rotation-ready.action';
import { AttachFlightAction } from './infra/http/action/attach-flight.action';
import { DetachFlightAction } from './infra/http/action/detach-flight.action';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateRotationAction,
    EditRotationAction,
    RemoveRotationAction,
    ListRotationsAction,
    GetRotationAction,
    AddLegAction,
    UpdateLegAction,
    RemoveLegAction,
    MarkRotationReadyAction,
    AttachFlightAction,
    DetachFlightAction,
  ],
  providers: [
    RotationsRepository,
    CreateRotationHandler,
    EditRotationHandler,
    RemoveRotationHandler,
    AddLegHandler,
    UpdateLegHandler,
    RemoveLegHandler,
    MarkRotationReadyHandler,
    AttachFlightToLegHandler,
    DetachFlightFromLegHandler,
    GetRotationByIdHandler,
    ListRotationsHandler,
    FlightLifecycleListener,
  ],
})
export class RotationsModule {}
