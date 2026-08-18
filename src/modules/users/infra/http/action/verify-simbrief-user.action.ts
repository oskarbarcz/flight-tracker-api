import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { SimbriefAccount } from '../../../model/simbrief-account.model';
import { VerifySimbriefUserQuery } from '../../../application/query/verify-simbrief-user.query';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';

@ApiTags('user')
@Controller('/api/v1/user')
export class VerifySimbriefUserAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Verify a SimBrief user ID',
    description:
      'Resolves a SimBrief user ID against SimBrief and returns the most recent flight plan generated on that account. ' +
      'The same check runs when the ID is saved on a profile, so a 200 here means the ID will be accepted by `PATCH /api/v1/user/me`.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'simbriefUserId',
    description: 'SimBrief user ID, as shown in the SimBrief account settings',
    example: '123456',
  })
  @ApiOkResponse({ type: SimbriefAccount })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({
    description: 'SimBrief does not know this user ID',
    type: GenericNotFoundResponse,
  })
  @ApiBadGatewayResponse({ description: 'SimBrief did not answer' })
  @Get('/simbrief/:simbriefUserId')
  run(
    @Param('simbriefUserId') simbriefUserId: string,
  ): Promise<SimbriefAccount> {
    const query = new VerifySimbriefUserQuery(simbriefUserId);

    return this.queryBus.execute(query);
  }
}
