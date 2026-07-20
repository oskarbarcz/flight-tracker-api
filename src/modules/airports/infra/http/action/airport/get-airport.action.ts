import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GetAirportResponse } from '../../request/airport.dto';
import { GetAirportByIdQuery } from '../../../../application/query/get-airport-by-id.query';

@ApiTags('airport')
@Controller('api/v1/airport')
export class GetAirportAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiOkResponse({ type: GetAirportResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @SkipAuth()
  @Get(':id')
  async run(@UuidParam('id') id: string): Promise<GetAirportResponse> {
    const query = new GetAirportByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
