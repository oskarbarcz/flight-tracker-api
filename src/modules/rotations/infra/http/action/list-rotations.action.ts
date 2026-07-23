import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { Rotation } from '../../../model/rotation.model';
import { ListRotationsQuery } from '../../../application/query/list-rotations.query';

@ApiTags('rotation')
@Controller('/api/v1/operator')
export class ListRotationsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List rotations of an operator' })
  @ApiOkResponse({ type: Rotation, isArray: true })
  @Get(':operatorId/rotation')
  @SkipAuth()
  list(@UuidParam('operatorId') operatorId: string): Promise<Rotation[]> {
    const query = new ListRotationsQuery(operatorId);
    return this.queryBus.execute(query);
  }
}
