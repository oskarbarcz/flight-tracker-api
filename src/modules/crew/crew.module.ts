import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CrewRepository } from './infra/database/repository/crew.repository';
import { ListOperatorCrewAction } from './infra/http/action/list-operator-crew.action';
import { ListFlightCrewAction } from './infra/http/action/list-flight-crew.action';
import { AssignFlightCrewAction } from './infra/http/action/assign-flight-crew.action';
import { UnassignFlightCrewAction } from './infra/http/action/unassign-flight-crew.action';
import { AssignCrewToFlightHandler } from './application/command/assign-crew-to-flight.command';
import { AssignCrewMemberToFlightHandler } from './application/command/assign-crew-member-to-flight.command';
import { UnassignCrewMemberFromFlightHandler } from './application/command/unassign-crew-member-from-flight.command';
import { ListOperatorCrewQueryHandler } from './application/query/list-operator-crew.query';
import { ListFlightCrewQueryHandler } from './application/query/list-flight-crew.query';

@Module({
  imports: [PrismaModule],
  controllers: [
    ListOperatorCrewAction,
    ListFlightCrewAction,
    AssignFlightCrewAction,
    UnassignFlightCrewAction,
  ],
  providers: [
    CrewRepository,
    AssignCrewToFlightHandler,
    AssignCrewMemberToFlightHandler,
    UnassignCrewMemberFromFlightHandler,
    ListOperatorCrewQueryHandler,
    ListFlightCrewQueryHandler,
  ],
})
export class CrewModule {}
