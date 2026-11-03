import { Controller, Get } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { CurrentOceanicTracksResponse } from '../../../model/oceanic-track.model';
import { GetCurrentOceanicTracksQuery } from '../../../application/query/get-current-oceanic-tracks.query';

@ApiTags('oceanic track')
@Controller('api/v1/oceanic-track')
export class GetCurrentOceanicTracksAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the oceanic tracks published now',
    description:
      'Returns every organised oceanic track currently published, with its validity, route, remarks, ' +
      'the raw message and every fix placed on the map. Today that is the Pacific tracks: westbound ' +
      'from Oakland and eastbound from Fukuoka. <br />' +
      '**NOTE:** The tracks are read from the FAA at most once every 15 minutes. A fix that could not ' +
      'be placed is listed in `unresolvedFixes` and left out of `fixes`.',
  })
  @ApiOkResponse({ type: CurrentOceanicTracksResponse })
  @ApiBadGatewayResponse({
    description: 'The FAA, or the function that reads it, did not answer',
  })
  @Get()
  @SkipAuth()
  async run(): Promise<CurrentOceanicTracksResponse> {
    return this.queryBus.execute(new GetCurrentOceanicTracksQuery());
  }
}
