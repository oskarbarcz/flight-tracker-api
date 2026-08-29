import { Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { DrawMissingPostcardsCommand } from '../../../../application/command/postcard/draw-missing-postcards.command';
import { DrawMissingPostcardsResponse } from '../../../../model/postcard/postcard.model';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';

@ApiTags('postcard')
@Controller('api/v1/postcard/draw-missing')
export class DrawMissingPostcardsAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Draw art for every city that has none',
    description:
      'Queues art for every city with no postcard, and for every postcard whose art is missing because it was never drawn or could not be drawn. Cities arriving through a database migration never announce themselves, so this is how they are given art after a deployment.\n\n' +
      'Drawing happens in the background, so this answers as soon as the work is queued rather than when the art exists. Safe to call again: a city that already has art is skipped.\n\n' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: DrawMissingPostcardsResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Post()
  @HttpCode(200)
  @Role(UserRole.Operations)
  run(): Promise<DrawMissingPostcardsResponse> {
    const command = new DrawMissingPostcardsCommand();
    return this.commandBus.execute(command);
  }
}
