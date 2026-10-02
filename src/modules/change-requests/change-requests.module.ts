import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { ChangeRequestsRepository } from './infra/database/change-requests.repository';
import { ChangeRequestTargets } from './application/target/change-request-targets';
import { AirportChangeRequestTarget } from './application/target/airport-change-request.target';
import { ParkingPositionChangeRequestTarget } from './application/target/parking-position-change-request.target';
import { RequestParkingPositionChangeAction } from './infra/http/action/parking-position/request-parking-position-change.action';
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
