import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../users/model/user-role';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { RemoveRotationCommand } from '../../../application/command/remove-rotation.command';

@ApiTags('rotation')
@Controller('/api/v1/rotation')
export class RemoveRotationAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Remove a draft rotation' })
  @ApiBearerAuth('jwt')
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Delete(':rotationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(@UuidParam('rotationId') rotationId: string): Promise<void> {
    const command = new RemoveRotationCommand(rotationId);
    await this.commandBus.execute(command);
  }
}
