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
import { Airframe } from '../../../model/airframe.model';
import { GetAirframeByTypeQuery } from '../../../application/query/get-airframe-by-type.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';

@ApiTags('airframe')
@Controller('api/v1/airframe')
export class GetAirframeByTypeAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one airframe by its ICAO type code' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'type',
    description: 'ICAO aircraft type designator (4-letter code)',
    example: 'B77W',
  })
  @ApiOkResponse({ type: Airframe })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':type')
  async findById(@Param('type') type: string): Promise<Airframe> {
    const query = new GetAirframeByTypeQuery(type);
    return this.queryBus.execute(query);
  }
}
