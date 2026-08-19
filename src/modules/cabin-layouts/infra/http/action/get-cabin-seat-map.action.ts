import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { CabinSeatMap } from '../../../model/cabin-seat-map.model';
import { EnsureCabinLayoutVersionCommand } from '../../../application/command/ensure-cabin-layout-version.command';
import { GetCabinSeatMapQuery } from '../../../application/query/get-cabin-seat-map.query';

@ApiTags('cabin layout')
@Controller('/api/v1/cabin-layout/:id/seat-map')
export class GetCabinSeatMapAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Retrieve the seats of a cabin layout',
    description:
      'Answers with the newest stored revision. The seats are read from AeroLOPA the first ' +
      'time a layout is asked for, so the first call to a layout is slower than the rest. ' +
      'Seat coordinates belong to the canvas of the deck the seat is on.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Cabin layout identifier',
    example: 'lh-74h',
  })
  @ApiOkResponse({ type: CabinSeatMap })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiBadGatewayResponse({ type: GenericNotFoundResponse })
  @Get()
  async run(@Param('id') id: string): Promise<CabinSeatMap> {
    const command = new EnsureCabinLayoutVersionCommand(id);
    await this.commandBus.execute(command);

    const query = new GetCabinSeatMapQuery(id);
    return this.queryBus.execute(query);
  }
}
