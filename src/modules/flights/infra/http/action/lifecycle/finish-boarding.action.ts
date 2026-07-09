import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { Loadsheet } from '../../../../model/loadsheet.model';
import { FinishBoardingCommand } from '../../../../application/command/finish-boarding.command';

@ApiTags('flight actions')
@Controller('api/v1/flight')
export class FinishBoardingAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Report flight boarding has finished',
    description:
      '**NOTE:** This action is only allowed for flights in boarding status. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'Final loadsheet',
    type: Loadsheet,
    examples: {
      withFuel: {
        summary: 'Final loadsheet with a fuel breakdown',
        value: {
          flightCrew: { pilots: 2, reliefPilots: 0, cabinCrew: 6 },
          passengers: 366,
          payload: 28.3,
          cargo: 8.9,
          zeroFuelWeight: 202.9,
          blockFuel: 11.9,
          fuel: {
            block: 11.9,
            taxi: 0.3,
            trip: 9.6,
            alternate: 0.9,
            reserve: 0.6,
            contingencyType: '5% of trip',
            contingencyAmount: 0.5,
            mel: 0,
            atc: 0,
            wxx: 0,
            extra: 0,
            tankering: 0,
          },
        },
      },
    },
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post('/:id/finish-boarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
    @Body() loadsheet: Loadsheet,
  ): Promise<void> {
    const command = new FinishBoardingCommand(id, request.user.sub, loadsheet);
    await this.commandBus.execute(command);
  }
}
