import { Module } from '@nestjs/common';
import { AirportsRepository } from './infra/database/airports.repository';
import { CreateAirportAction } from './infra/http/action/airport/create-airport.action';
import { ListAirportsAction } from './infra/http/action/airport/list-airports.action';
import { GetAirportAction } from './infra/http/action/airport/get-airport.action';
import { UpdateAirportAction } from './infra/http/action/airport/update-airport.action';
import { DeleteAirportAction } from './infra/http/action/airport/delete-airport.action';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { SkyLinkModule } from '../../core/provider/skylink/skylink.module';
import { CreateAirportHandler } from './application/command/create-airport.command';
import { ImportAirportByIcaoHandler } from './application/command/import-airport-by-icao.command';
import { UpdateAirportHandler } from './application/command/update-airport.command';
import { RemoveAirportHandler } from './application/command/remove-airport.command';
import { GetAirportByIdHandler } from './application/query/get-airport-by-id.query';
import { ListAllAirportsHandler } from './application/query/list-all-airports.query';
import { GetAirportByIcaoCodeHandler } from './application/query/get-airport-by-icao-code.query';
import { TerminalsRepository } from './infra/database/terminals.repository';
import { CreateTerminalAction } from './infra/http/action/terminal/create-terminal.action';
import { ListTerminalsAction } from './infra/http/action/terminal/list-terminals.action';
import { GetTerminalAction } from './infra/http/action/terminal/get-terminal.action';
import { UpdateTerminalAction } from './infra/http/action/terminal/update-terminal.action';
import { DeleteTerminalAction } from './infra/http/action/terminal/delete-terminal.action';
import { CreateTerminalHandler } from './application/command/terminals/create-terminal.command';
import { UpdateTerminalHandler } from './application/command/terminals/update-terminal.command';
import { RemoveTerminalHandler } from './application/command/terminals/remove-terminal.command';
import { GetTerminalByIdHandler } from './application/query/terminal/get-terminal-by-id.query';
import { ListTerminalsByAirportHandler } from './application/query/terminal/list-terminals-by-airport.query';
import { GatesRepository } from './infra/database/gates.repository';
import { CreateGateAction } from './infra/http/action/gate/create-gate.action';
import { ListGatesAction } from './infra/http/action/gate/list-gates.action';
import { GetGateAction } from './infra/http/action/gate/get-gate.action';
import { UpdateGateAction } from './infra/http/action/gate/update-gate.action';
import { DeleteGateAction } from './infra/http/action/gate/delete-gate.action';
import { CreateGateHandler } from './application/command/gates/create-gate.command';
import { UpdateGateHandler } from './application/command/gates/update-gate.command';
import { RemoveGateHandler } from './application/command/gates/remove-gate.command';
import { GetGateByIdHandler } from './application/query/gate/get-gate-by-id.query';
import { ListGatesByAirportHandler } from './application/query/gate/list-gates-by-airport.query';
import { ParkingPositionsRepository } from './infra/database/parking-positions.repository';
import { CreateParkingPositionAction } from './infra/http/action/parking-position/create-parking-position.action';
import { ListParkingPositionsAction } from './infra/http/action/parking-position/list-parking-positions.action';
import { GetParkingPositionAction } from './infra/http/action/parking-position/get-parking-position.action';
import { UpdateParkingPositionAction } from './infra/http/action/parking-position/update-parking-position.action';
import { RemoveParkingPositionAction } from './infra/http/action/parking-position/remove-parking-position.action';
import { CreateParkingPositionHandler } from './application/command/parking-positions/create-parking-position.command';
import { UpdateParkingPositionHandler } from './application/command/parking-positions/update-parking-position.command';
import { RemoveParkingPositionHandler } from './application/command/parking-positions/remove-parking-position.command';
import { GetParkingPositionByIdHandler } from './application/query/parking-position/get-parking-position-by-id.query';
import { ListParkingPositionsByAirportHandler } from './application/query/parking-position/list-parking-positions-by-airport.query';
import { RunwaysRepository } from './infra/database/runways.repository';
import { CreateRunwayAction } from './infra/http/action/runway/create-runway.action';
import { ListRunwaysAction } from './infra/http/action/runway/list-runways.action';
import { GetRunwayAction } from './infra/http/action/runway/get-runway.action';
import { UpdateRunwayAction } from './infra/http/action/runway/update-runway.action';
import { DeleteRunwayAction } from './infra/http/action/runway/delete-runway.action';
import { CreateRunwayHandler } from './application/command/runways/create-runway.command';
import { UpdateRunwayHandler } from './application/command/runways/update-runway.command';
import { RemoveRunwayHandler } from './application/command/runways/remove-runway.command';
import { GetRunwayByIdHandler } from './application/query/runway/get-runway-by-id.query';
import { GetRunwayByDesignatorHandler } from './application/query/runway/get-runway-by-designator.query';
import { ListRunwaysByAirportHandler } from './application/query/runway/list-runways-by-airport.query';
import { AssertParkingPositionBelongsToAirportHandler } from './application/assert/assert-parking-position-belongs-to-airport.command';
import { AssertRunwayBelongsToAirportHandler } from './application/assert/assert-runway-belongs-to-airport.command';
import { AssertAirportExistsHandler } from './application/assert/assert-airport-exists.query';
import { WeatherModule } from '../../core/provider/weather/weather.module';
import { AirportWeatherRepository } from './infra/database/airport-weather.repository';
import { GetWeatherAction } from './infra/http/action/weather/get-weather.action';
import { GetAirportWeatherHandler } from './application/query/weather/get-airport-weather.query';
import { RefreshWeatherHandler } from './application/command/weather/refresh-weather.command';
import { WatchAirportsHandler } from './application/command/weather/watch-airports.command';
import { UnwatchFlightAirportsHandler } from './application/command/weather/unwatch-flight-airports.command';
import { WeatherFlightLifecycleListener } from './application/event/external/weather-flight-lifecycle.listener';
import { WeatherRefreshService } from './infra/service/weather-refresh.service';

@Module({
  imports: [PrismaModule, SkyLinkModule, WeatherModule],
  controllers: [
    CreateAirportAction,
    ListAirportsAction,
    GetAirportAction,
    UpdateAirportAction,
    DeleteAirportAction,
    CreateTerminalAction,
    ListTerminalsAction,
    GetTerminalAction,
    UpdateTerminalAction,
    DeleteTerminalAction,
    CreateGateAction,
    ListGatesAction,
    GetGateAction,
    UpdateGateAction,
    DeleteGateAction,
    CreateParkingPositionAction,
    ListParkingPositionsAction,
    GetParkingPositionAction,
    UpdateParkingPositionAction,
    RemoveParkingPositionAction,
    CreateRunwayAction,
    ListRunwaysAction,
    GetRunwayAction,
    UpdateRunwayAction,
    DeleteRunwayAction,
    GetWeatherAction,
  ],
  providers: [
    AirportsRepository,
    TerminalsRepository,
    GatesRepository,
    ParkingPositionsRepository,
    RunwaysRepository,
    CreateAirportHandler,
    ImportAirportByIcaoHandler,
    UpdateAirportHandler,
    RemoveAirportHandler,
    GetAirportByIdHandler,
    GetAirportByIcaoCodeHandler,
    ListAllAirportsHandler,
    CreateTerminalHandler,
    UpdateTerminalHandler,
    RemoveTerminalHandler,
    GetTerminalByIdHandler,
    ListTerminalsByAirportHandler,
    CreateGateHandler,
    UpdateGateHandler,
    RemoveGateHandler,
    GetGateByIdHandler,
    ListGatesByAirportHandler,
    CreateParkingPositionHandler,
    UpdateParkingPositionHandler,
    RemoveParkingPositionHandler,
    GetParkingPositionByIdHandler,
    ListParkingPositionsByAirportHandler,
    CreateRunwayHandler,
    UpdateRunwayHandler,
    RemoveRunwayHandler,
    GetRunwayByIdHandler,
    GetRunwayByDesignatorHandler,
    ListRunwaysByAirportHandler,
    AssertParkingPositionBelongsToAirportHandler,
    AssertRunwayBelongsToAirportHandler,
    AssertAirportExistsHandler,
    AirportWeatherRepository,
    GetAirportWeatherHandler,
    RefreshWeatherHandler,
    WatchAirportsHandler,
    UnwatchFlightAirportsHandler,
    WeatherFlightLifecycleListener,
    WeatherRefreshService,
  ],
})
export class AirportsModule {}
