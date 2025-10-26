import {
  ReportDiversionRequest,
  GetDiversionResponse,
} from '../dto/diversion.dto';
import {
  Body,
  Controller,
  Get,
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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidParam } from '../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import { AuthorizedRequest } from '../../../core/http/request/authorized.request';
import { DiversionRepository } from '../repository/diversion.repository';

@ApiTags('flight diversion')
@Controller('api/v1/flight/:flightId/diversion')
export class DiversionController {
  constructor(private readonly diversionRepository: DiversionRepository) {}

  @ApiOperation({
    summary: 'Report flight diversion',
    description:
      'This action will inreversibly announce flight diversion. <br />' +
      '**NOTE:** This action is only allowed for flights in `taxiing_out` or `in_cruise` status. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` or `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiBody({ type: ReportDiversionRequest })
  @ApiNoContentResponse({
    description: 'Flight diversion was successfully reported',
  })
  @ApiBadRequestResponse({
    description:
      'Flight id is not valid uuid v4 or domain logic error occurred',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async report(
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: ReportDiversionRequest,
  ): Promise<void> {
    await this.diversionRepository.create(flightId, request.user, body);
  }

  @ApiOperation({
    summary: 'Get flight diversion details',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` or `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiBody({ type: ReportDiversionRequest })
  @ApiOkResponse({
    type: GetDiversionResponse,
    description: 'Flight diversion details',
  })
  @ApiBadRequestResponse({
    description: 'Flight id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Diversion for given flight ID does not exist',
    type: GenericNotFoundResponse,
  })
  @Get()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  public async get(
    @UuidParam('flightId') flightId: string,
  ): Promise<GetDiversionResponse> {
    return this.diversionRepository.get(flightId);
  }
}
