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
import { AircraftHoldLayout } from '../../../model/hold-layout.model';
import { GetHoldLayoutQuery } from '../../../application/query/get-hold-layout.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';

@ApiTags('cargo hold')
@Controller('api/v1/cargo-hold')
export class GetHoldLayoutAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the hold configuration of one airframe type',
    description:
      'Reports 404 for an airframe type this system carries no curated hold data for. Position designators are composed of the compartment number, the position ordinal within it and the side; that is a convention of this system, since no public source designates hold positions for a given type.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'type',
    description: 'ICAO aircraft type designator (4-letter code)',
    example: 'B77W',
  })
  @ApiOkResponse({ type: AircraftHoldLayout })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':type')
  async findByType(@Param('type') type: string): Promise<AircraftHoldLayout> {
    const query = new GetHoldLayoutQuery(type);
    return this.queryBus.execute(query);
  }
}
