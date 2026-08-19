import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../users/model/user-role';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { CabinLayoutSyncResult } from '../../../model/cabin-layout.model';
import { SyncCabinLayoutsCommand } from '../../../application/command/sync-cabin-layouts.command';

@ApiTags('cabin layout')
@Controller('/api/v1/cabin-layout/sync')
export class SyncCabinLayoutsAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Refresh the catalogue of available cabin layouts',
    description:
      'Reads the layout index AeroLOPA publishes and brings the local catalogue into line with it. ' +
      'Layouts AeroLOPA no longer publishes are retired rather than removed.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: CabinLayoutSyncResult })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Post()
  @HttpCode(HttpStatus.OK)
  @Role(UserRole.Operations)
  async run(): Promise<CabinLayoutSyncResult> {
    const command = new SyncCabinLayoutsCommand();
    return this.commandBus.execute(command);
  }
}
