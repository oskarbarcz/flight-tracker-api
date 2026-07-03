import { Prisma } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

// Most coordinates below are real `aeroway=gate` nodes sourced from OpenStreetMap
// via Overpass, matched to each seeded gate by ref (falling back to nearest terminal
// when a ref like KJFK's "A2" is reused across terminals). Where no OSM gate node
// exists for a name (e.g. EDDF's A10/B5, LFPG's A30/B40/C50/K20/G10, BIKF, CYYR's
// only gate), the coordinate is copied from the gate's linked parking position
// instead of inventing one.
export async function loadGates(): Promise<void> {
  const gates: Prisma.GateCreateManyInput[] = [
    // EDDF — Frankfurt T1
    {
      id: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101',
      airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
      terminalId: 'd7fd7a84-1589-4a4f-9072-a9773f66e2b5',
      name: 'A10',
      category: 'schengen',
      parkingPositionId: 'ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9',
      coordinates: { latitude: 50.047131, longitude: 8.574266 },
    },

    {
      id: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102',
      airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
      terminalId: 'd7fd7a84-1589-4a4f-9072-a9773f66e2b5',
      name: 'A11',
      category: 'schengen',
      parkingPositionId: 'ae098e8f-b088-41a6-a566-880c7dd5e931',
      coordinates: { latitude: 50.048797, longitude: 8.569462 },
    },

    // EDDF — Frankfurt T2
    {
      id: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2201',
      airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
      terminalId: '26106c8a-aaee-4b84-bb6c-b5af3389e22f',
      name: 'B5',
      category: 'non-schengen',
      parkingPositionId: 'df5a931d-3b2e-4767-bdd4-1c14689e0e13',
      coordinates: { latitude: 50.046416, longitude: 8.574424 },
    },

    // EPWA — Warsaw TA
    {
      id: '5d3e4ef5-4c6b-4f4d-9a32-8f2eacbd3001',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      terminalId: '104014ec-110e-483d-9f3c-8f6909fe4823',
      name: '21',
      category: 'schengen',
      parkingPositionId: '012e3707-a09f-44ce-8e9e-b418eed3d818',
      coordinates: { latitude: 52.173136, longitude: 20.969341 },
    },

    {
      id: '9419fc0a-3086-43dc-be31-73f2973571b5',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      terminalId: '104014ec-110e-483d-9f3c-8f6909fe4823',
      name: '10',
      category: 'schengen',
      parkingPositionId: '5537f377-dc35-41a9-9eda-c4db2f9a6431',
      coordinates: { latitude: 52.173992, longitude: 20.969256 },
    },

    {
      id: 'd0758a79-052d-41ca-a2e6-63646b6aa08e',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      terminalId: '104014ec-110e-483d-9f3c-8f6909fe4823',
      name: '11',
      category: 'non-schengen',
      parkingPositionId: '8edd1dd1-cae2-4fd3-8c35-54c82c42540b',
      coordinates: { latitude: 52.174289, longitude: 20.968988 },
    },

    {
      id: '407da717-62e4-4e3c-afe0-7c2a109a0c47',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      terminalId: '104014ec-110e-483d-9f3c-8f6909fe4823',
      name: '12',
      category: 'international',
      parkingPositionId: 'cf78a695-d0eb-4e40-9c4d-6b81344e0515',
      coordinates: { latitude: 52.174328, longitude: 20.96896 },
    },

    {
      id: 'e21c2d50-b3e8-4724-8a3b-bca7ed2a7283',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      terminalId: '104014ec-110e-483d-9f3c-8f6909fe4823',
      name: '13',
      category: 'schengen',
      parkingPositionId: 'a18d7aa6-309a-4bf2-9d8d-d4662e305abf',
      coordinates: { latitude: 52.174508, longitude: 20.9686 },
    },

    {
      id: '738178ce-2b83-4b26-ba82-916c38b4e853',
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      terminalId: '104014ec-110e-483d-9f3c-8f6909fe4823',
      name: '14',
      category: 'non-schengen',
      parkingPositionId: '3254f9a2-7680-41bb-89f1-962aa8065fa4',
      coordinates: { latitude: 52.174493, longitude: 20.968553 },
    },

    // KJFK — Terminal 1
    {
      id: 'c38c1139-f62a-4bd8-bd14-38b0ab5b4bfb',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: 'a7da9825-8019-478d-a309-1fb6b53aac42',
      name: 'A2',
      category: 'international',
      parkingPositionId: 'f426d84e-bc33-4f2e-b60f-f401ede88276',
      coordinates: { latitude: 40.642769, longitude: -73.780621 },
    },

    {
      id: '3f2814f7-7dd6-4609-ba6a-878a4f2428b6',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: 'a7da9825-8019-478d-a309-1fb6b53aac42',
      name: 'B22',
      category: 'international',
      parkingPositionId: 'e74b3184-4bdd-4055-b8ce-62d7d95df0fb',
      coordinates: { latitude: 40.64195, longitude: -73.783613 },
    },

    // KJFK — Terminal 4
    {
      id: 'c7f9a428-94a7-45d1-9f41-359b42df78c5',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: 'e49ca9e7-91f2-406e-81e6-3b95131f8de4',
      name: 'A2',
      category: 'international',
      parkingPositionId: '50ae9c78-f004-4cfb-a7f0-5c6d3d2e839e',
      coordinates: { latitude: 40.643304, longitude: -73.780546 },
    },

    {
      id: '971dbcc5-6846-42d2-b63d-8800426e428e',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: 'e49ca9e7-91f2-406e-81e6-3b95131f8de4',
      name: 'B31',
      category: 'international',
      parkingPositionId: '60fb0200-9601-4d70-b74f-284bbf110b04',
      coordinates: { latitude: 40.639836, longitude: -73.780883 },
    },

    // KJFK — Terminal 5
    {
      id: '66960547-4cbd-4aa4-9de3-eaf0168784d7',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: '592039df-d9e4-4100-aedd-9b244ac925ea',
      name: '5',
      category: 'domestic',
      parkingPositionId: 'b31050da-2513-4d6c-a126-94445d459708',
      coordinates: { latitude: 40.650501, longitude: -73.783297 },
    },

    {
      id: '2e2a935e-8f88-47b7-a9ac-93c1ffe50413',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: '592039df-d9e4-4100-aedd-9b244ac925ea',
      name: '16',
      category: 'domestic',
      parkingPositionId: '767cd8c0-b406-4b03-ab85-edd3662062b8',
      coordinates: { latitude: 40.648983, longitude: -73.789978 },
    },

    // KJFK — Terminal 7
    {
      id: '8093d0cb-724d-4d88-866a-b4855414ff31',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: '51f61626-90b9-45b7-b6d5-b77eff65ee9d',
      name: '1',
      category: 'international',
      parkingPositionId: '09163a54-695a-4a25-a925-7dd5565a523b',
      coordinates: { latitude: 40.649272, longitude: -73.783925 },
    },

    {
      id: 'f63db16a-2a38-4905-a9d8-57a022e6ade8',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: '51f61626-90b9-45b7-b6d5-b77eff65ee9d',
      name: '12',
      category: 'international',
      parkingPositionId: '209ecc4f-e628-45ab-bb3c-bfe0ff0a9333',
      coordinates: { latitude: 40.648377, longitude: -73.791402 },
    },

    // KJFK — Terminal 8
    {
      id: '24d6f6bb-4584-4ecb-acb3-75eac537428c',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: '87813a68-dd8d-4539-b2c1-08ad31a1e9f2',
      name: '8',
      category: 'domestic',
      parkingPositionId: '699b2a46-2514-47e3-8636-1b5cb889a653',
      coordinates: { latitude: 40.64799, longitude: -73.792317 },
    },

    {
      id: '7193ae0c-e68e-4c78-a8b5-fe42da97cc28',
      airportId: '3c721cc6-c653-4fad-be43-dc9d6a149383',
      terminalId: '87813a68-dd8d-4539-b2c1-08ad31a1e9f2',
      name: '36',
      category: 'international',
      parkingPositionId: '9569141a-b04e-4821-ae5a-86a0b957626b',
      coordinates: { latitude: 40.649735, longitude: -73.794118 },
    },

    // LFPG — Terminal 1
    {
      id: '5da4248a-f9b7-46e0-a973-a5fccf4e2129',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: 'b74d1002-ad6f-4d97-a878-71d990a3c811',
      name: '30',
      category: 'non-schengen',
      parkingPositionId: '2d5ad855-ba9f-4763-b2be-5b332cf0f5d2',
      coordinates: { latitude: 49.015979, longitude: 2.543913 },
    },

    // LFPG — Terminal 2A
    {
      id: 'b8312f90-cd69-49c6-8247-728911fd44bf',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: '4fa7345d-be33-4896-a3f7-fc9313af5ddd',
      name: 'A30',
      category: 'schengen',
      parkingPositionId: '4ee007ef-1ffe-44ff-8fb7-1b6e7032b33f',
      coordinates: { latitude: 49.002299, longitude: 2.558243 },
    },

    // LFPG — Terminal 2B
    {
      id: '157b3240-b4f6-434b-8427-07eca0d6016c',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: '52f82035-9f0e-4de2-986b-e66dfda568ec',
      name: 'B40',
      category: 'schengen',
      parkingPositionId: 'dc8c5412-e571-423e-8932-9b73b04ae6f8',
      coordinates: { latitude: 49.00896, longitude: 2.55412 },
    },

    // LFPG — Terminal 2C
    {
      id: '3457492a-6c1e-4e54-90bb-327d8842b4ea',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: '5d78bb4c-4a52-4ad1-b414-b45658f651de',
      name: 'C50',
      category: 'schengen',
      parkingPositionId: '677b380b-75a3-4322-a686-a99e803c5cc0',
      coordinates: { latitude: 49.00896, longitude: 2.55412 },
    },

    // LFPG — Terminal 2D
    {
      id: '6d720c19-9d00-4be2-8c6a-a28e8e0f918a',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: 'eb00095b-f756-4778-8697-08dc04f68b20',
      name: 'D60',
      category: 'schengen',
      parkingPositionId: 'f0f1b1d7-27b3-47c0-bbf8-67f69418a609',
      coordinates: { latitude: 49.004959, longitude: 2.567434 },
    },

    // LFPG — Terminal 2E
    {
      id: '32b66b94-a93b-4448-8610-ee9038b31e77',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: '3da719b7-385b-43b5-844b-5b0d4d001e93',
      name: 'K20',
      category: 'non-schengen',
      parkingPositionId: '7dba9a37-54a8-48fc-bf13-fa0ad243f505',
      coordinates: { latitude: 49.00896, longitude: 2.55412 },
    },

    // LFPG — Terminal 2F
    {
      id: 'fde31b51-3aef-4a87-8f7b-e42a1faa4fa9',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: '093ca44b-d957-4172-a44f-e6468efbd761',
      name: 'F30',
      category: 'non-schengen',
      parkingPositionId: '501cdc2c-da73-4ac1-bf85-93277a61ba3f',
      coordinates: { latitude: 49.006508, longitude: 2.574264 },
    },

    // LFPG — Terminal 2G
    {
      id: 'c401c054-6b41-4a2f-a38a-60993e7f20ae',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: 'c90ffc41-36ba-45f3-aff1-cc1605ce46ad',
      name: 'G10',
      category: 'schengen',
      parkingPositionId: '28587120-4472-4651-b77b-36d02b0dd033',
      coordinates: { latitude: 49.003475, longitude: 2.556203 },
    },

    // LFPG — Terminal 3
    {
      id: '82246aff-6a10-4a28-9b54-4ee60f51147f',
      airportId: '79b8f884-f67d-4585-b540-36b0be7f551e',
      terminalId: 'adfe2cc7-77f5-487e-b6db-6d09d2582697',
      name: '50',
      category: 'non-schengen',
      parkingPositionId: '64f639bb-4f64-42e2-86bb-b6b6e8ebe9af',
      coordinates: { latitude: 49.014785, longitude: 2.538702 },
    },

    // CYYR — Goose Bay Main Terminal
    {
      id: '64ed6c9a-0ba6-4139-bb0f-a89a366de95d',
      airportId: 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae',
      terminalId: '419b38a7-2083-4134-b1df-ce41162c9280',
      name: '1',
      category: 'international',
      parkingPositionId: '710fc7de-b3e5-404a-b4f0-6d31a7862194',
      coordinates: { latitude: 53.319168, longitude: -60.409444 },
    },

    // BIKF — Reykjavik Leifur Eiriksson Terminal
    {
      id: 'a42f8ee7-aa47-4e0a-bcd1-8aa63491acb7',
      airportId: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a',
      terminalId: '1109190a-b9cb-43c7-a55e-1e3a5257e8f7',
      name: 'D2',
      category: 'schengen',
      parkingPositionId: '94806a1b-3b2a-4213-9245-8cf2b383a898',
      coordinates: { latitude: 63.985, longitude: -22.6056 },
    },

    {
      id: 'b5a6c772-14dd-4223-b1ce-c7dc9aa21574',
      airportId: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a',
      terminalId: '1109190a-b9cb-43c7-a55e-1e3a5257e8f7',
      name: 'A4',
      category: 'non-schengen',
      parkingPositionId: 'efbca774-780b-4c29-bed6-35a36f58194c',
      coordinates: { latitude: 63.985, longitude: -22.6056 },
    },

    // CYYT — St. John's ATB
    {
      id: '4638202f-c77c-4d31-ae9e-0e1d89d20736',
      airportId: '6cf1fcd8-d072-46b5-8132-bd885b43dd97',
      terminalId: 'ceed33c4-3d86-4f1b-94e7-eaa190483035',
      name: '1',
      category: 'international',
      parkingPositionId: '329f0e1c-383b-471f-8da3-fb4b8004df7e',
      coordinates: { latitude: 47.613567, longitude: -52.744368 },
    },

    // KPHL — Terminal A-East
    {
      id: 'aa0dafb5-51a6-49a1-9706-daab22c0c5fa',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: 'd7a108e0-1de6-4a6f-85a8-d18fa0d3911c',
      name: 'A14',
      category: 'international',
      parkingPositionId: '009c150e-1a83-4c5b-8ba1-8e6d775b51f8',
      coordinates: { latitude: 39.874885, longitude: -75.248284 },
    },

    // KPHL — Terminal A-West
    {
      id: 'b5ac8c09-e087-4e7a-8ec1-f76c7e537602',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: 'd8070021-ffd3-456c-a195-e3185c3c3d7c',
      name: 'A1',
      category: 'domestic',
      parkingPositionId: 'dce84e76-b92d-4531-a32a-33e52718b299',
      coordinates: { latitude: 39.873348, longitude: -75.244392 },
    },

    // KPHL — Terminal B
    {
      id: 'e5118011-dfc9-499d-95c4-429bfe8053bf',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: '61d5ca07-a5d7-4ebd-94da-9b56eb702f88',
      name: 'B6',
      category: 'domestic',
      parkingPositionId: 'b2630ac0-15b3-4238-bc1b-13db6cc6939f',
      coordinates: { latitude: 39.874753, longitude: -75.243876 },
    },

    // KPHL — Terminal C
    {
      id: '8fbd0308-3988-4e2a-9260-7c0f82ba7887',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: '96bfdc88-01b2-43b4-b2c9-d1c8a85e490f',
      name: 'C25',
      category: 'domestic',
      parkingPositionId: 'c15d983a-c1a1-41f8-be82-7082b3b1fcae',
      coordinates: { latitude: 39.87479, longitude: -75.240519 },
    },

    // KPHL — Terminal D
    {
      id: '07ce6138-25e5-4347-88a4-4e0e20d3b91e',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: '0ef99006-355e-4826-b0e5-071a56ea202c',
      name: 'D9',
      category: 'domestic',
      parkingPositionId: '94205e30-626d-4053-bc8e-97e119ef8e7e',
      coordinates: { latitude: 39.875481, longitude: -75.237749 },
    },

    // KPHL — Terminal E
    {
      id: 'ce309d07-6e4a-4cdc-b620-eb7a249eec24',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: '69f947e5-b07e-4b06-94ea-8744daf37970',
      name: 'E15',
      category: 'international',
      parkingPositionId: 'c337e7e6-3d59-463d-85e6-6a6311d3e972',
      coordinates: { latitude: 39.877761, longitude: -75.236245 },
    },

    // KPHL — Terminal F
    {
      id: '899bc668-4e1a-4ce2-b72a-e18ee3bffe5c',
      airportId: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
      terminalId: '573d8fe2-58ab-43ff-83b8-9951e7178c79',
      name: 'F30',
      category: 'domestic',
      parkingPositionId: '7cd86525-7a91-45a4-8461-61e42f63c089',
      coordinates: { latitude: 39.881828, longitude: -75.237073 },
    },

    // KBOS — Terminal A
    {
      id: '4ce42952-8861-468b-9657-84e123133884',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: '374ad856-886a-4cd1-9353-a06b22a8eaa9',
      name: 'A4',
      category: 'domestic',
      parkingPositionId: 'b79dab35-27e0-4bc4-849a-2f2a277e3838',
      coordinates: { latitude: 42.364654, longitude: -71.022864 },
    },

    {
      id: '4d8b8279-7deb-4009-9374-2a5b4dae973d',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: '374ad856-886a-4cd1-9353-a06b22a8eaa9',
      name: 'A8',
      category: 'domestic',
      parkingPositionId: '10803705-cdb6-4f34-9057-f3bb1894b484',
      coordinates: { latitude: 42.363948, longitude: -71.021385 },
    },

    // KBOS — Terminal B
    {
      id: 'd08ea4b5-7702-4f05-8237-b5b1c739f9ae',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: 'b963b4fa-c326-4634-8f0e-5ee8a3003443',
      name: 'B30',
      category: 'domestic',
      parkingPositionId: '2ab63efc-009d-47ae-9a8b-7d07a010392a',
      coordinates: { latitude: 42.363167, longitude: -71.016897 },
    },

    {
      id: '5a3878dc-fb1e-412e-9eb0-69759682ee24',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: 'b963b4fa-c326-4634-8f0e-5ee8a3003443',
      name: 'B36',
      category: 'international',
      parkingPositionId: 'fe676b1d-4b11-4edc-a5a7-c0174dec1055',
      coordinates: { latitude: 42.363389, longitude: -71.016854 },
    },

    // KBOS — Terminal C
    {
      id: '148b7f78-6b7f-4402-9c89-a872c5c8bd28',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: '1c0da133-4f4b-4c78-b57c-59b10a846a6c',
      name: 'C15',
      category: 'domestic',
      parkingPositionId: '2bd3c522-5a43-48b6-a718-14d651bcc0b3',
      coordinates: { latitude: 42.367786, longitude: -71.01531 },
    },

    {
      id: '095f55fc-c4a4-4f53-b121-a48c92e0e780',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: '1c0da133-4f4b-4c78-b57c-59b10a846a6c',
      name: 'C30',
      category: 'domestic',
      parkingPositionId: '24b698fb-3075-4a5b-9c0a-aa8a27f00a60',
      coordinates: { latitude: 42.36546, longitude: -71.014497 },
    },

    // KBOS — Terminal E
    {
      id: 'af8ef34b-0881-41b8-8a4e-a07cdee80b8b',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: '0f6597b8-8d79-41dd-9bb0-59619e6a534a',
      name: 'E1A',
      category: 'international',
      parkingPositionId: 'ef7b0d87-9944-4fe1-b0f2-61d0127ad19e',
      coordinates: { latitude: 42.368132, longitude: -71.018139 },
    },

    {
      id: '85f4f8f0-61ff-4b7d-b7f9-cf17b6e583ae',
      airportId: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
      terminalId: '0f6597b8-8d79-41dd-9bb0-59619e6a534a',
      name: 'E10',
      category: 'international',
      parkingPositionId: 'b6d53cc3-4f97-4c4b-9e2f-cff161c24f5f',
      coordinates: { latitude: 42.37118, longitude: -71.020536 },
    },

    // EDDW — Bremen Hauptterminal
    {
      id: '83456027-c380-4d53-953d-288a022efe2d',
      airportId: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf',
      terminalId: '2b70a9cc-5c9e-4239-90d6-de30e60e2b27',
      name: '5',
      category: 'schengen',
      parkingPositionId: '16f06be2-a4b3-4105-ba52-9d6a1235818e',
      coordinates: { latitude: 53.051918, longitude: 8.783696 },
    },
  ];

  const prisma = new PrismaService();

  await prisma.gate.createMany({ data: gates });
}
