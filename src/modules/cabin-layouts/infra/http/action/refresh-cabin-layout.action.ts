import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../users/model/user-role';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { CabinLayoutRefreshResult } from '../../../model/cabin-seat-map.model';
import { RefreshCabinLayoutCommand } from '../../../application/command/refresh-cabin-layout.command';

@ApiTags('cabin layout')
@Controller('/api/v1/cabin-layout/:id/refresh')
export class RefreshCabinLayoutAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Re-read a cabin layout from AeroLOPA',
    description:
      'Fetches the layout again and records a new revision only when the cabin differs from ' +
      'the newest stored one. AeroLOPA publishes no change signal, so this is the only way ' +
      'to pick up a revised cabin.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Cabin layout identifier',
    example: 'lh-74h',
  })
  @ApiOkResponse({ type: CabinLayoutRefreshResult })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @HttpCode(HttpStatus.OK)
  @Role(UserRole.Operations)
  async run(@Param('id') id: string): Promise<CabinLayoutRefreshResult> {
    const command = new RefreshCabinLayoutCommand(id);
    return this.commandBus.execute(command);
  }
}
