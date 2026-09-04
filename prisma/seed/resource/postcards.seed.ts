import { Prisma } from '../../client/client';
import { CITY_IDS } from './cities.seed';

export const POSTCARD_IDS = {
  frankfurt: '057741fa-357e-462e-a5c6-0d4e6091c685',
  warsaw: '78e684b8-a61e-40df-b0bc-1dc96c180267',
  newYork: 'ede93ece-e158-44d9-9f5b-4bd295b605ec',
  paris: '3b2409d5-3f5a-47e3-b25a-7b7e648094c3',
  gooseBay: '2b470e7f-4d91-42e9-bb9f-1e0a9b997ccf',
  reykjavik: '9f6e5970-def6-4332-bce4-573b1b5c9922',
  stJohns: '04032753-3666-465e-bae0-b2e2b2c588cb',
  philadelphia: '6b1b8e82-b9fb-4501-8716-b039c22e5c08',
  boston: 'edf2c8d8-5cc6-433c-a291-b99886c2736a',
  bremen: '6bae6830-8794-434e-89ca-2aa118fc9335',
  shannon: '1c8f4a26-5b73-4e91-a2d6-7f3b9c5e8d40',
  gander: '6e2d9b58-4a17-4c63-b8f5-2d1a7e6c9b34',
  knock: '9a5c3e71-8d24-4fab-9b17-5c8e2a4d6f19',
} as const;

const ART_UUIDS = {
  frankfurt: 'dd8cd3b6-38bd-49b7-87f4-e03d8ec05147',
  warsaw: 'e1af9fef-d903-4f8d-8d23-b644b2b961c2',
  newYork: 'aa25fe19-3d1b-48c7-919d-a0eab5eba254',
  paris: 'd7f1b070-69e5-46c5-8a9f-5c3fdd2b8a81',
  gooseBay: '213b197b-b74a-4ae0-84ff-be37190c00d9',
  reykjavik: '63ed849d-2865-418c-8d4c-059aab2096bb',
  stJohns: '8d8fc159-e5b1-4a3d-ac4d-1f0d1aae8f1d',
  philadelphia: 'f57fbaa1-4332-4dba-9d10-931cc053111f',
  boston: 'a13b60a0-9253-4c77-a8fa-68bfb07c5971',
  bremen: 'cefddab1-b5dc-4764-bb7d-43bf1f606208',
  shannon: 'b74e1f38-9c52-4a67-8d13-6e2b5f9a3c48',
  gander: 'e51a8d27-3f64-4b92-a7c5-1d8f6b3e9a52',
  knock: '4f9b6c13-7e28-45da-8f61-3a5d2b7e9c64',
} as const;

const ART_BASE_URL = 'http://functions-mock:1080/mypreflight-files/postcards';

export async function loadPostcards(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const cities = Object.keys(POSTCARD_IDS) as (keyof typeof POSTCARD_IDS)[];

  await tx.postcard.createMany({
    data: cities.map((city) =>
      city === 'warsaw'
        ? {
            id: POSTCARD_IDS[city],
            cityId: CITY_IDS[city],
            status: 'pending' as const,
          }
        : {
            id: POSTCARD_IDS[city],
            cityId: CITY_IDS[city],
            status: 'ready' as const,
            artUuid: ART_UUIDS[city],
            imageUrl: `${ART_BASE_URL}/${ART_UUIDS[city]}.png`,
            width: 1152,
            height: 1536,
          },
    ),
  });
}
