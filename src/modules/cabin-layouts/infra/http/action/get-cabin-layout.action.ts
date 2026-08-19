import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { CabinLayout } from '../../../model/cabin-layout.model';
import { GetCabinLayoutQuery } from '../../../application/query/get-cabin-layout.query';

@ApiTags('cabin layout')
@Controller('/api/v1/cabin-layout/:id')
export class GetCabinLayoutAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one cabin layout' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Cabin layout identifier',
    example: 'lh-32n',
  })
  @ApiOkResponse({ type: CabinLayout })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async run(@Param('id') id: string): Promise<CabinLayout> {
    const query = new GetCabinLayoutQuery(id);
    return this.queryBus.execute(query);
  }
}
