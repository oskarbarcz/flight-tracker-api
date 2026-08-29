import { SkyLinkClient } from './skylink.client';
import {
  MultipleSkylinkAirportsFoundError,
  SkylinkAirportNotFoundError,
  SkylinkUnknownCountryError,
} from './skylink.error';

const BASE_URL = 'https://skylink.example';
const API_KEY = 'shared-key';

function airport(country: string) {
  return {
    icao: 'EGLL',
    iata: 'LHR',
    name: 'London Heathrow Airport',
    city: 'London',
    country,
    timezone: 'Europe/London',
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  } as Response;
}

describe('SkyLinkClient', () => {
  let fetchMock: jest.SpyInstance;

  const client = new SkyLinkClient(BASE_URL, API_KEY);

  afterEach(() => {
    fetchMock?.mockRestore();
  });

  it('keeps the country code the provider reported', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('GB')]));

    const found = await client.getAirportByIcaoCode('EGLL');

    expect(found.country).toBe('GB');
  });

  it('normalises the letter case of the reported code', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('gb')]));

    const found = await client.getAirportByIcaoCode('EGLL');

    expect(found.country).toBe('GB');
  });

  it('refuses a country the catalogue does not recognise', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('QQ')]));

    await expect(client.getAirportByIcaoCode('EGLL')).rejects.toThrow(
      SkylinkUnknownCountryError,
    );
  });

  it('refuses a user-assigned placeholder code', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('ZZ')]));

    await expect(client.getAirportByIcaoCode('EGLL')).rejects.toThrow(
      SkylinkUnknownCountryError,
    );
  });

  it('refuses a country reported as a name rather than a code', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('United Kingdom')]));

    await expect(client.getAirportByIcaoCode('EGLL')).rejects.toThrow(
      SkylinkUnknownCountryError,
    );
  });

  it('names the unusable value in the error', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('QQ')]));

    await expect(client.getAirportByIcaoCode('EGLL')).rejects.toThrow(/QQ/);
  });

  it('reports an airport the provider does not hold', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, []));

    await expect(client.getAirportByIcaoCode('EGLL')).rejects.toThrow(
      SkylinkAirportNotFoundError,
    );
  });

  it('reports an ambiguous lookup', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, [airport('GB'), airport('GB')]));

    await expect(client.getAirportByIcaoCode('EGLL')).rejects.toThrow(
      MultipleSkylinkAirportsFoundError,
    );
  });
});
