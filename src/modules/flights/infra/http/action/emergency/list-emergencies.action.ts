import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { GetEmergencyResponse } from '../../request/emergency.dto';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { ListEmergenciesQuery } from '../../../../application/query/emergency/list-emergencies.query';

@ApiTags('flight emergency')
@Controller('api/v1/flight/:flightId/emergency')
export class ListEmergenciesAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List flight emergency declarations',
    description:
      'Returns every emergency declaration ever filed against the flight (active and resolved), newest first. Returns an empty array when none has been declared.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiOkResponse({ type: GetEmergencyResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  public async run(
    @UuidParam('flightId') flightId: string,
  ): Promise<GetEmergencyResponse[]> {
    const query = new ListEmergenciesQuery(flightId);
    return this.queryBus.execute(query);
  }
}
