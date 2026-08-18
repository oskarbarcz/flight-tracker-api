import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { InvalidSimbriefUserIdError } from '../../model/error/simbrief.error';

export class AssertSimbriefUserExistsQuery {
  constructor(public readonly simbriefUserId: string) {}
}

@QueryHandler(AssertSimbriefUserExistsQuery)
export class AssertSimbriefUserExistsHandler implements IQueryHandler<AssertSimbriefUserExistsQuery> {
  private readonly logger = new Logger(AssertSimbriefUserExistsHandler.name);

  constructor(private readonly simbriefClient: SimbriefClient) {}

  async execute(query: AssertSimbriefUserExistsQuery): Promise<void> {
    const { simbriefUserId } = query;

    try {
      const ofp =
        await this.simbriefClient.findOperationalFlightPlan(simbriefUserId);

      if (ofp !== null) {
        return;
      }
    } catch (error) {
      this.logger.warn(
        `Simbrief could not confirm user ${simbriefUserId}, accepting it unverified: ${getErrorMessage(error)}`,
      );

      return;
    }

    throw new InvalidSimbriefUserIdError();
  }
}
