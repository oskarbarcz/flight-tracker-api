import { Prisma } from '../../client/client';
import {
  WeatherInformationType,
  WeatherSource,
} from '../../../src/modules/airports/model/airport-weather.model';

const WARSAW = '616cbdd7-ccfc-4687-8cf6-1e7236435046';
const FRANKFURT = 'f35c094a-bec5-4803-be32-bd80a14b441a';
const BOSTON = 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3';

const AVIATION_WEATHER_GOV_FETCHED_AT = new Date('2026-07-08T12:00:00.000Z');
const SAY_INTENTIONS_FETCHED_AT = new Date('2026-07-08T11:30:00.000Z');

export async function loadWeather(tx: Prisma.TransactionClient): Promise<void> {
  const weather: Prisma.AirportWeatherCreateManyInput[] = [
    {
      id: 'bf427471-4e87-4b4c-a5f9-24f5e295ab05',
      airportId: WARSAW,
      source: WeatherSource.AviationWeatherGov,
      informationType: WeatherInformationType.Metar,
      content: 'METAR EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG',
      lastFetched: AVIATION_WEATHER_GOV_FETCHED_AT,
    },
    {
      id: '9ea4d8fe-e098-466f-a3f1-e997d34031c3',
      airportId: WARSAW,
      source: WeatherSource.AviationWeatherGov,
      informationType: WeatherInformationType.Taf,
      content:
        'TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT',
      lastFetched: AVIATION_WEATHER_GOV_FETCHED_AT,
    },
    {
      id: '17349a5b-a0f3-4740-b04a-6493576fdccd',
      airportId: WARSAW,
      source: WeatherSource.SayIntentions,
      informationType: WeatherInformationType.Atis,
      content:
        'Warsaw Chopin airport, information Sierra. 1030 Zulu. Arriving runway 11. Departing runway 15. Wind 150 at 9. CAVOK. Temperature 29, dewpoint 12. QNH 1013. Transition level 80. Advise on initial contact you have information Sierra.',
      lastFetched: SAY_INTENTIONS_FETCHED_AT,
    },
    {
      id: '029388aa-805a-4de8-89bb-a3ac4db9a88f',
      airportId: WARSAW,
      source: WeatherSource.SayIntentions,
      informationType: WeatherInformationType.Metar,
      content: 'EPWA 101030Z 15009KT 130V190 CAVOK 29/12 Q1013 NOSIG',
      lastFetched: SAY_INTENTIONS_FETCHED_AT,
    },
    {
      id: '51f1542c-243f-4114-adf9-164e6a22b458',
      airportId: WARSAW,
      source: WeatherSource.SayIntentions,
      informationType: WeatherInformationType.Taf,
      content:
        'TAF EPWA 100830Z 1009/1109 17007KT CAVOK BECMG 1010/1013 26012KT',
      lastFetched: SAY_INTENTIONS_FETCHED_AT,
    },
    {
      id: 'e799cf41-0344-4b29-b111-ee9f635535e2',
      airportId: FRANKFURT,
      source: WeatherSource.AviationWeatherGov,
      informationType: WeatherInformationType.Metar,
      content: 'METAR EDDF 081200Z 24008KT 9999 FEW035 22/12 Q1018 NOSIG',
      lastFetched: AVIATION_WEATHER_GOV_FETCHED_AT,
    },
    {
      id: 'f721308b-9a04-4b20-8af9-89b25fd1986e',
      airportId: FRANKFURT,
      source: WeatherSource.AviationWeatherGov,
      informationType: WeatherInformationType.Taf,
      content:
        'TAF EDDF 081100Z 0812/0918 24010KT 9999 FEW035 BECMG 0815/0817 27012KT',
      lastFetched: AVIATION_WEATHER_GOV_FETCHED_AT,
    },
    {
      id: '0112b47c-576a-40c9-b669-e49abea97dc7',
      airportId: BOSTON,
      source: WeatherSource.AviationWeatherGov,
      informationType: WeatherInformationType.Metar,
      content: 'METAR KBOS 081154Z 21009KT 10SM FEW040 24/16 A3000',
      lastFetched: AVIATION_WEATHER_GOV_FETCHED_AT,
    },
    {
      id: '7c183849-61ec-4088-b58d-e88b5bc9ce4a',
      airportId: BOSTON,
      source: WeatherSource.AviationWeatherGov,
      informationType: WeatherInformationType.Taf,
      content: 'TAF KBOS 081120Z 0812/0918 21010KT P6SM FEW040',
      lastFetched: AVIATION_WEATHER_GOV_FETCHED_AT,
    },
    {
      id: 'f6b7c755-acda-45a9-a6b6-457466aa0e08',
      airportId: BOSTON,
      source: WeatherSource.SayIntentions,
      informationType: WeatherInformationType.Atis,
      content:
        'Logan airport, information Delta. 1054 Zulu. ILS runway 4 right approach in use. Departing runway 9. Wind 210 at 9. Visibility 10. Few 4000. Temperature 24, dewpoint 16. Altimeter 3000. Advise on initial contact you have information Delta.',
      lastFetched: SAY_INTENTIONS_FETCHED_AT,
    },
    {
      id: 'd0045533-6800-4ef8-ac64-0f66e371f701',
      airportId: BOSTON,
      source: WeatherSource.SayIntentions,
      informationType: WeatherInformationType.Metar,
      content: 'KBOS 101054Z 21009KT 10SM FEW040 24/16 A3000',
      lastFetched: SAY_INTENTIONS_FETCHED_AT,
    },
    {
      id: '77b8fa2f-eeb1-4f1c-a3e5-fbbc5f428563',
      airportId: BOSTON,
      source: WeatherSource.SayIntentions,
      informationType: WeatherInformationType.Taf,
      content: 'TAF KBOS 100820Z 1009/1109 21010KT P6SM FEW040',
      lastFetched: SAY_INTENTIONS_FETCHED_AT,
    },
  ];

  await tx.airportWeather.createMany({ data: weather });
}
