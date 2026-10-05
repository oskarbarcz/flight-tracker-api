import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { ChangeRequestsRepository } from './infra/database/change-requests.repository';
import { ChangeRequestTargets } from './application/target/change-request-targets';
import { AirportChangeRequestTarget } from './application/target/airport-change-request.target';
import { ParkingPositionChangeRequestTarget } from './application/target/parking-position-change-request.target';
import { GateChangeRequestTarget } from './application/target/gate-change-request.target';
import { TerminalChangeRequestTarget } from './application/target/terminal-change-request.target';
import { RunwayChangeRequestTarget } from './application/target/runway-change-request.target';
import { RequestParkingPositionChangeAction } from './infra/http/action/parking-position/request-parking-position-change.action';
import { RequestGateChangeAction } from './infra/http/action/gate/request-gate-change.action';
import { RequestTerminalChangeAction } from './infra/http/action/terminal/request-terminal-change.action';
import { RequestRunwayChangeAction } from './infra/http/action/runway/request-runway-change.action';
import { SubmitChangeRequestHandler } from './application/command/submit-change-request.command';
import { AcceptChangeRequestHandler } from './application/command/accept-change-request.command';
import { RejectChangeRequestHandler } from './application/command/reject-change-request.command';
import { WithdrawChangeRequestHandler } from './application/command/withdraw-change-request.command';
import { ListChangeRequestsHandler } from './application/query/list-change-requests.query';
import { ListMyChangeRequestsHandler } from './application/query/list-my-change-requests.query';
import { GetChangeRequestByIdHandler } from './application/query/get-change-request-by-id.query';
import { RequestAirportChangeAction } from './infra/http/action/airport/request-airport-change.action';
import { ListChangeRequestsAction } from './infra/http/action/review/list-change-requests.action';
import { GetChangeRequestAction } from './infra/http/action/review/get-change-request.action';
import { AcceptChangeRequestAction } from './infra/http/action/review/accept-change-request.action';
import { RejectChangeRequestAction } from './infra/http/action/review/reject-change-request.action';
import { ListMyChangeRequestsAction } from './infra/http/action/mine/list-my-change-requests.action';
import { WithdrawChangeRequestAction } from './infra/http/action/mine/withdraw-change-request.action';

@Module({
  imports: [PrismaModule],
  controllers: [
    RequestAirportChangeAction,
    RequestParkingPositionChangeAction,
    RequestGateChangeAction,
    RequestTerminalChangeAction,
    RequestRunwayChangeAction,
    ListChangeRequestsAction,
    GetChangeRequestAction,
    AcceptChangeRequestAction,
    RejectChangeRequestAction,
    ListMyChangeRequestsAction,
    WithdrawChangeRequestAction,
  ],
  providers: [
    ChangeRequestsRepository,
    AirportChangeRequestTarget,
    ParkingPositionChangeRequestTarget,
    GateChangeRequestTarget,
    TerminalChangeRequestTarget,
    RunwayChangeRequestTarget,
    ChangeRequestTargets,
    SubmitChangeRequestHandler,
    AcceptChangeRequestHandler,
    RejectChangeRequestHandler,
    WithdrawChangeRequestHandler,
    ListChangeRequestsHandler,
    ListMyChangeRequestsHandler,
    GetChangeRequestByIdHandler,
  ],
})
export class ChangeRequestsModule {}
