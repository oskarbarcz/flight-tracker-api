import { Controller, Get } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { Rotation } from '../../../model/rotation.model';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation')
@Controller('/api/v1/rotation')
export class GetRotationAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one rotation' })
  @ApiOkResponse({ type: Rotation })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':rotationId')
  @SkipAuth()
  findOne(@UuidParam('rotationId') rotationId: string): Promise<Rotation> {
    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
