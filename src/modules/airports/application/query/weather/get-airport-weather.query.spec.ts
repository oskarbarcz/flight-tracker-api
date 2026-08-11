import {
  GetAirportWeatherHandler,
  GetAirportWeatherQuery,
} from './get-airport-weather.query';
import {
  WeatherInformationType,
  WeatherSource,
} from '../../../model/airport-weather.model';
import { WeatherSourceFilter } from '../../../infra/http/request/weather.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';

const AIRPORT_ID = 'd8f2b1c4-5a63-4e0f-9b7d-2c4e6a8f1b30';
const USER_ID = 'b1c7e4a9-3f52-4d68-8a1b-7e9c2d5f4a06';

describe('GetAirportWeatherHandler', () => {
  let weatherRepository: { findByAirportId: jest.Mock };
  let airportsRepository: { exists: jest.Mock };
  let queryBus: { execute: jest.Mock };
  let handler: GetAirportWeatherHandler;

  beforeEach(() => {
    weatherRepository = { findByAirportId: jest.fn().mockResolvedValue([]) };
    airportsRepository = { exists: jest.fn().mockResolvedValue(true) };
    queryBus = { execute: jest.fn() };

    handler = new GetAirportWeatherHandler(
      weatherRepository as never,
      airportsRepository as never,
      queryBus as never,
    );
  });

  it('rejects an airport that does not exist', async () => {
    airportsRepository.exists.mockResolvedValue(false);

    const query = new GetAirportWeatherQuery(
      AIRPORT_ID,
      WeatherSourceFilter.All,
    );

    await expect(handler.execute(query)).rejects.toThrow(AirportNotFoundError);
    expect(weatherRepository.findByAirportId).not.toHaveBeenCalled();
  });

  it('applies no source predicate when every source is requested', async () => {
    const query = new GetAirportWeatherQuery(
      AIRPORT_ID,
      WeatherSourceFilter.All,
      USER_ID,
    );

    await handler.execute(query);

    expect(weatherRepository.findByAirportId).toHaveBeenCalledWith(
      AIRPORT_ID,
      undefined,
    );
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('resolves a named source without consulting the profile', async () => {
    const query = new GetAirportWeatherQuery(
      AIRPORT_ID,
      WeatherSourceFilter.SayIntentions,
      USER_ID,
    );

    await handler.execute(query);

    expect(weatherRepository.findByAirportId).toHaveBeenCalledWith(
      AIRPORT_ID,
      WeatherSource.SayIntentions,
    );
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('resolves the default source from the profile of an identified user', async () => {
    queryBus.execute.mockResolvedValue(WeatherSource.SayIntentions);

    const query = new GetAirportWeatherQuery(
      AIRPORT_ID,
      WeatherSourceFilter.UserDefault,
      USER_ID,
    );

    await handler.execute(query);

    expect(queryBus.execute).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findByAirportId).toHaveBeenCalledWith(
      AIRPORT_ID,
      WeatherSource.SayIntentions,
    );
  });

  it('falls back to aviationweather.gov when no user is identified', async () => {
    const query = new GetAirportWeatherQuery(
      AIRPORT_ID,
      WeatherSourceFilter.UserDefault,
    );

    await handler.execute(query);

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(weatherRepository.findByAirportId).toHaveBeenCalledWith(
      AIRPORT_ID,
      WeatherSource.AviationWeatherGov,
    );
  });

  it('returns the stored reports as the response collection', async () => {
    weatherRepository.findByAirportId.mockResolvedValue([
      {
        id: 'f0a1b2c3-4d5e-4f60-9a8b-7c6d5e4f3a21',
        source: WeatherSource.SayIntentions,
        informationType: WeatherInformationType.Atis,
        content: 'Warsaw Chopin airport, information Sierra.',
        lastFetched: new Date('2026-08-10T10:30:00.000Z'),
      },
    ]);

    const query = new GetAirportWeatherQuery(
      AIRPORT_ID,
      WeatherSourceFilter.All,
    );

    await expect(handler.execute(query)).resolves.toEqual([
      {
        id: 'f0a1b2c3-4d5e-4f60-9a8b-7c6d5e4f3a21',
        source: WeatherSource.SayIntentions,
        informationType: WeatherInformationType.Atis,
        content: 'Warsaw Chopin airport, information Sierra.',
        lastFetched: new Date('2026-08-10T10:30:00.000Z'),
      },
    ]);
  });
});
