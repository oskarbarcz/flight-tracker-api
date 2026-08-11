import {
  RefreshWeatherCommand,
  RefreshWeatherHandler,
} from './refresh-weather.command';
import {
  WeatherInformationType,
  WeatherSource,
} from '../../../model/airport-weather.model';

const WARSAW = { airportId: 'a1', icaoCode: 'EPWA' };
const FRANKFURT = { airportId: 'a2', icaoCode: 'EDDF' };

describe('RefreshWeatherHandler', () => {
  let weatherRepository: { saveReports: jest.Mock };
  let airportsRepository: { listMonitored: jest.Mock; getIcaoCodes: jest.Mock };
  let weatherClient: { fetchMetar: jest.Mock; fetchTaf: jest.Mock };
  let sayIntentionsClient: { fetchWeather: jest.Mock };
  let handler: RefreshWeatherHandler;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    weatherRepository = { saveReports: jest.fn().mockResolvedValue(undefined) };
    airportsRepository = {
      listMonitored: jest.fn().mockResolvedValue([WARSAW, FRANKFURT]),
      getIcaoCodes: jest.fn().mockResolvedValue([WARSAW]),
    };
    weatherClient = {
      fetchMetar: jest.fn().mockResolvedValue(
        new Map([
          ['EPWA', 'METAR EPWA'],
          ['EDDF', 'METAR EDDF'],
        ]),
      ),
      fetchTaf: jest.fn().mockResolvedValue(
        new Map([
          ['EPWA', 'TAF EPWA'],
          ['EDDF', 'TAF EDDF'],
        ]),
      ),
    };
    sayIntentionsClient = {
      fetchWeather: jest.fn().mockResolvedValue({
        metar: 'EPWA raw',
        taf: 'TAF raw',
        atis: 'information Sierra',
      }),
    };

    handler = new RefreshWeatherHandler(
      weatherRepository as never,
      airportsRepository as never,
      weatherClient as never,
      sayIntentionsClient as never,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  function savedFor(source: WeatherSource, airportId: string) {
    return weatherRepository.saveReports.mock.calls
      .filter((call) => call[0] === airportId && call[1] === source)
      .flatMap((call) => call[2])
      .map((report) => report.informationType);
  }

  it('makes no upstream request when nothing is monitored', async () => {
    airportsRepository.listMonitored.mockResolvedValue([]);

    await handler.execute(new RefreshWeatherCommand());

    expect(weatherClient.fetchMetar).not.toHaveBeenCalled();
    expect(sayIntentionsClient.fetchWeather).not.toHaveBeenCalled();
    expect(weatherRepository.saveReports).not.toHaveBeenCalled();
  });

  it('stores reports from both sources for every monitored airport', async () => {
    await handler.execute(new RefreshWeatherCommand());

    expect(savedFor(WeatherSource.AviationWeatherGov, 'a1')).toEqual([
      WeatherInformationType.Metar,
      WeatherInformationType.Taf,
    ]);
    expect(savedFor(WeatherSource.SayIntentions, 'a1')).toEqual([
      WeatherInformationType.Atis,
      WeatherInformationType.Metar,
      WeatherInformationType.Taf,
    ]);
    expect(savedFor(WeatherSource.SayIntentions, 'a2')).toHaveLength(3);
  });

  it('batches aviationweather.gov into one call per information type', async () => {
    await handler.execute(new RefreshWeatherCommand());

    expect(weatherClient.fetchMetar).toHaveBeenCalledTimes(1);
    expect(weatherClient.fetchMetar).toHaveBeenCalledWith(['EPWA', 'EDDF']);
    expect(weatherClient.fetchTaf).toHaveBeenCalledTimes(1);
    expect(sayIntentionsClient.fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('stores only the information types a source actually published', async () => {
    sayIntentionsClient.fetchWeather.mockResolvedValue({
      metar: 'EPWA raw',
      atis: 'information Sierra',
    });

    await handler.execute(new RefreshWeatherCommand());

    expect(savedFor(WeatherSource.SayIntentions, 'a1')).toEqual([
      WeatherInformationType.Atis,
      WeatherInformationType.Metar,
    ]);
  });

  it('keeps storing one source when the other is unreachable', async () => {
    weatherClient.fetchMetar.mockRejectedValue(new Error('agov down'));

    await expect(
      handler.execute(new RefreshWeatherCommand()),
    ).resolves.toBeUndefined();

    expect(savedFor(WeatherSource.AviationWeatherGov, 'a1')).toEqual([]);
    expect(savedFor(WeatherSource.SayIntentions, 'a1')).toHaveLength(3);
  });

  it('keeps refreshing the remaining airports when one fails', async () => {
    sayIntentionsClient.fetchWeather.mockImplementation((icao: string) =>
      icao === 'EPWA'
        ? Promise.reject(new Error('rate limited'))
        : Promise.resolve({ metar: 'EDDF raw' }),
    );

    await handler.execute(new RefreshWeatherCommand());

    expect(savedFor(WeatherSource.SayIntentions, 'a1')).toEqual([]);
    expect(savedFor(WeatherSource.SayIntentions, 'a2')).toEqual([
      WeatherInformationType.Metar,
    ]);
  });

  it('refreshes only the airports the command names', async () => {
    await handler.execute(new RefreshWeatherCommand(['a1']));

    expect(airportsRepository.listMonitored).not.toHaveBeenCalled();
    expect(airportsRepository.getIcaoCodes).toHaveBeenCalledWith(['a1']);
    expect(sayIntentionsClient.fetchWeather).toHaveBeenCalledTimes(1);
  });
});
