import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { Rotation, RotationStatus } from '../../../model/rotation.model';
import { ListRotationsQuery } from '../../../application/query/list-rotations.query';
import { ListRotationsFilters } from '../request/rotation.request';

@ApiTags('rotation')
@Controller('/api/v1/operator')
export class ListRotationsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List rotations of an operator' })
  @ApiQuery({ name: 'status', enum: RotationStatus, required: false })
  @ApiOkResponse({ type: Rotation, isArray: true })
  @Get(':operatorId/rotation')
  @SkipAuth()
  list(
    @UuidParam('operatorId') operatorId: string,
    @Query() filters: ListRotationsFilters,
  ): Promise<Rotation[]> {
    const query = new ListRotationsQuery(operatorId, filters.status);
    return this.queryBus.execute(query);
  }
}
