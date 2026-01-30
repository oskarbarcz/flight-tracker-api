import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { UserStatsDto } from '../../dto/get-user.dto';
import { FlightStatus } from '../../../flights/entity/flight.entity';
import {
  FilledSchedule,
  FilledTimesheet,
} from '../../../flights/entity/timesheet.entity';

export class GetUserStatsQuery extends Query<UserStatsDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserStatsQuery)
export class GetUserStatsHandler implements IQueryHandler<GetUserStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserStatsQuery): Promise<UserStatsDto> {
    const flights = await this.prisma.flight.findMany({
      where: {
        captainId: query.userId,
        status: {
          in: [
            FlightStatus.OnBlock,
            FlightStatus.OffboardingFinished,
            FlightStatus.OffboardingFinished,
            FlightStatus.Closed,
          ],
        },
      },
    });

    let totalBlockTime = 0;

    for (const flight of flights) {
      const ts = flight.timesheet as unknown as FilledTimesheet;
      const actual = ts.actual as FilledSchedule;

      const offBlock = new Date(actual.offBlockTime);
      const onBlock = new Date(actual.onBlockTime);

      if (offBlock && onBlock && onBlock > offBlock) {
        const blockMinutes =
          (onBlock.getTime() - offBlock.getTime()) / (1000 * 60);
        totalBlockTime += blockMinutes;
      }
    }

    return {
      total: {
        blockTime: totalBlockTime,
      },
    };
  }
}
