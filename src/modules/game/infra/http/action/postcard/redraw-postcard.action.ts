import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { RedrawPostcardCommand } from '../../../../application/command/postcard/redraw-postcard.command';
import { RedrawPostcardRequest } from '../../request/postcard.dto';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';

@ApiTags('postcard')
@Controller('api/v1/postcard/:postcardId/redraw')
export class RedrawPostcardAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: "Replace a postcard's art",
    description:
      'Draws the postcard again under a new stored location, so every pilot holding it sees the new art and no cache serves the old. Whether a pilot has seen the postcard is left untouched, so nobody is shown a reveal twice.\n\n' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'postcardId', description: 'Postcard unique identifier' })
  @ApiBody({ type: RedrawPostcardRequest, required: false })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({
    description: 'The art for this postcard is already being drawn',
  })
  @Post()
  @HttpCode(204)
  @Role(UserRole.Operations)
  async run(
    @UuidParam('postcardId') postcardId: string,
    @Body() body: RedrawPostcardRequest,
  ): Promise<void> {
    const command = new RedrawPostcardCommand(postcardId, body);
    await this.commandBus.execute(command);
  }
}
