import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { GetRotationResponse } from '../../request/rotation.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetRotationByIdQuery } from '../../../../application/query/rotation/get-rotation-by-id.query';

@ApiTags('operator rotations')
@Controller('/api/v1/operator/:operatorId/rotation')
export class GetRotationAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Retrieve one rotation' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiOkResponse({ type: GetRotationResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':rotationId')
  async findById(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('operatorId') operatorId: string,
  ): Promise<GetRotationResponse> {
    const query = new GetRotationByIdQuery(operatorId, rotationId);
    return this.queryBus.execute(query);
  }
}
