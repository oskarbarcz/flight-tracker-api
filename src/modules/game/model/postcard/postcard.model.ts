import { ApiProperty } from '@nestjs/swagger';
import { CityRef } from '../../../airports/model/city.model';
import { CountryRef } from '../../../countries/model/country.model';

export enum PostcardStatus {
  Pending = 'pending',
  Ready = 'ready',
  Failed = 'failed',
}

export class MyPostcard {
  @ApiProperty({ example: '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63' })
  id!: string;

  @ApiProperty({ type: CityRef })
  city!: CityRef;

  @ApiProperty({ type: CountryRef })
  country!: CountryRef;

  @ApiProperty({
    description:
      'Where the art is stored, absent while it is still being drawn',
    type: String,
    nullable: true,
    example: 'https://files.example/postcards/3f2a1b4c.jpg',
  })
  imageUrl!: string | null;

  @ApiProperty({ type: Number, nullable: true, example: 1152 })
  width!: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 1536 })
  height!: number | null;

  @ApiProperty({
    description:
      'Whether the art is drawn, still being drawn, or could not be drawn',
    enum: PostcardStatus,
    example: PostcardStatus.Ready,
  })
  status!: PostcardStatus;

  @ApiProperty({ type: String, example: '2026-08-26T18:30:00.000Z' })
  awardedAt!: Date;

  @ApiProperty({
    description:
      'When the pilot first saw this postcard, absent until they acknowledge it',
    type: String,
    nullable: true,
    example: '2026-08-26T18:31:00.000Z',
  })
  seenAt!: Date | null;
}

export class GetMyPostcardsResponse {
  @ApiProperty({ type: [MyPostcard] })
  postcards!: MyPostcard[];

  @ApiProperty({
    description: 'How many postcards exist in total, earned or not',
    example: 40,
  })
  total!: number;
}

export class CataloguePostcard {
  @ApiProperty({ example: '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63' })
  id!: string;

  @ApiProperty({ type: CityRef })
  city!: CityRef;

  @ApiProperty({ type: CountryRef })
  country!: CountryRef;

  @ApiProperty({ type: String, nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ type: Number, nullable: true, example: 1152 })
  width!: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 1536 })
  height!: number | null;

  @ApiProperty({ enum: PostcardStatus, example: PostcardStatus.Ready })
  status!: PostcardStatus;

  @ApiProperty({
    description:
      'When the art last changed state, whether drawing began, finished or failed. Absent until it is first drawn',
    type: String,
    nullable: true,
    example: '2026-08-26T18:30:00.000Z',
  })
  statusChangedAt!: Date | null;

  @ApiProperty({
    description:
      'Why the art could not be drawn, absent unless the art failed. The only account of a failure the system keeps',
    type: String,
    nullable: true,
    example: 'The generator will not draw "Beijing China"',
  })
  failureReason!: string | null;

  @ApiProperty({
    description: 'How many pilots hold this postcard',
    example: 12,
  })
  heldBy!: number;
}

export class GetPostcardCatalogueResponse {
  @ApiProperty({ type: [CataloguePostcard] })
  postcards!: CataloguePostcard[];

  @ApiProperty({
    description:
      'Cities holding no postcard at all, so they are named nowhere above. Drawing the missing art gives each of them one',
    type: [CityRef],
  })
  citiesWithoutPostcard!: CityRef[];
}

export class DrawMissingPostcardsResponse {
  @ApiProperty({
    description: 'How many cities were queued to have their art drawn',
    example: 12,
  })
  queued!: number;

  @ApiProperty({
    description: 'The cities queued, in the order they were queued',
    type: [CityRef],
  })
  cities!: CityRef[];
}
