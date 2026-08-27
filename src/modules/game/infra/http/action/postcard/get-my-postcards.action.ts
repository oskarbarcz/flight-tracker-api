import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetMyPostcardsResponse } from '../../../../model/postcard/postcard.model';
import { GetMyPostcardsQuery } from '../../../../application/query/postcard/get-my-postcards.query';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';

@ApiTags('my postcards')
@Controller('api/v1/user/me/postcard')
export class GetMyPostcardsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get the postcards I have collected',
    description:
      'Answers only the postcards the caller has earned, alongside how many exist in total. Cities the caller has not reached are not named.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetMyPostcardsResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @Get()
  run(@Req() request: AuthorizedRequest): Promise<GetMyPostcardsResponse> {
    const query = new GetMyPostcardsQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
