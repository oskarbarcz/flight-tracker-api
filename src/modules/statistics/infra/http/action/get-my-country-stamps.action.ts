import { Controller, Get, Param, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetCountryStampsResponse } from '../../../model/statistics.model';
import { GetMyCountryStampsQuery } from '../../../application/query/get-my-country-stamps.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('statistics')
@Controller('/api/v1/user')
export class GetMyCountryStampsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get every visit to one country, most recent first',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'code', example: 'DE' })
  @ApiOkResponse({ type: GetCountryStampsResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/me/stats/countries/:code')
  run(
    @Req() request: AuthorizedRequest,
    @Param('code') code: string,
  ): Promise<GetCountryStampsResponse> {
    const query = new GetMyCountryStampsQuery(request.user.sub, code);
    return this.queryBus.execute(query);
  }
}
