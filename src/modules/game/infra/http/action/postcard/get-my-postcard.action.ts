import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { MyPostcard } from '../../../../model/postcard/postcard.model';
import { GetMyPostcardQuery } from '../../../../application/query/postcard/get-my-postcard.query';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { UuidParam } from '../../../../../../core/validation/uuid.param';

@ApiTags('my postcards')
@Controller('api/v1/user/me/postcard/:postcardId')
export class GetMyPostcardAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get one postcard I have collected',
    description:
      'A postcard the caller has not earned is reported as not found, so the response does not disclose whether it exists.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'postcardId', description: 'Postcard unique identifier' })
  @ApiOkResponse({ type: MyPostcard })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  run(
    @Req() request: AuthorizedRequest,
    @UuidParam('postcardId') postcardId: string,
  ): Promise<MyPostcard> {
    const query = new GetMyPostcardQuery(request.user.sub, postcardId);
    return this.queryBus.execute(query);
  }
}
