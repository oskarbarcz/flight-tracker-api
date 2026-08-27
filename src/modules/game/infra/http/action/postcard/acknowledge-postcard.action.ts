import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { AcknowledgePostcardCommand } from '../../../../application/command/postcard/acknowledge-postcard.command';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { UuidParam } from '../../../../../../core/validation/uuid.param';

@ApiTags('my postcards')
@Controller('api/v1/user/me/postcard/:postcardId/seen')
export class AcknowledgePostcardAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Mark a postcard as seen',
    description:
      'Ends the reveal for this postcard so it is presented once. Acknowledging one already seen succeeds and changes nothing.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'postcardId', description: 'Postcard unique identifier' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @HttpCode(204)
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('postcardId') postcardId: string,
  ): Promise<void> {
    const command = new AcknowledgePostcardCommand(
      request.user.sub,
      postcardId,
    );
    await this.commandBus.execute(command);
  }
}
