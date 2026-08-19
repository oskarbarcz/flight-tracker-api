import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import {
  CabinLayoutList,
  DEFAULT_LAYOUT_PAGE_SIZE,
  ListCabinLayoutsRequest,
} from '../request/cabin-layout.request';
import { ListCabinLayoutsQuery } from '../../../application/query/list-cabin-layouts.query';

@ApiTags('cabin layout')
@Controller('/api/v1/cabin-layout')
export class ListCabinLayoutsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Browse available cabin layouts' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: CabinLayoutList })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @Get()
  async run(
    @Query() request: ListCabinLayoutsRequest,
  ): Promise<CabinLayoutList> {
    const query = new ListCabinLayoutsQuery(
      request.airlineIata,
      request.aircraftIata,
      request.retired,
      request.limit ?? DEFAULT_LAYOUT_PAGE_SIZE,
      request.offset ?? 0,
    );

    return this.queryBus.execute(query);
  }
}
