export type SeatRating = 'green' | 'yellow' | 'red';

export type CabinClass = 'first' | 'business' | 'premium_economy' | 'economy';

export type WindowStatus = 'great' | 'average' | 'poor' | 'none';

export type CommentSentiment = 'good' | 'bad' | 'neutral';

export type CommentSeverity = 'minor' | 'moderate' | 'major';

export type AerolopaErrorCode =
  | 'BAD_REQUEST'
  | 'SEAT_MAP_NOT_FOUND'
  | 'AEROLOPA_UNAVAILABLE'
  | 'SEAT_MAP_UNREADABLE'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR';

export interface AerolopaSeatComment {
  slug: string;
  comment: string;
  sentiment: CommentSentiment;
  severity: CommentSeverity | null;
}

export interface AerolopaSeat {
  designator: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  reversed: boolean;
  cabin: CabinClass;
  rating: SeatRating | null;
  color: string;
  bookable: boolean;
  blocked: boolean;
  crewRest: boolean;
  windowStatus: WindowStatus | null;
  seatProduct: string | null;
  comments: AerolopaSeatComment[];
}

export interface AerolopaCabin {
  code: string;
  name: string;
  seatCount: number;
  rows: string | null;
  pitch: string | null;
  width: string | null;
  recline: string | null;
  description: string | null;
}

export interface AerolopaAssets {
  image: string;
  imageNeutral: string;
  svg: string;
  seatRects: string;
}

export interface AerolopaCanvas {
  width: number;
  height: number;
}

export interface AerolopaSeatCounts {
  first: number;
  business: number;
  premium_economy: number;
  economy: number;
  total: number;
}

export interface AerolopaSeatMap {
  slug: string;
  airlineIata: string;
  aircraftIata: string;
  aircraftType: string;
  aircraftTypeDisplayed: string;
  manufacturer: string;
  haulType: string;
  isDualDeck: boolean;
  totalSeats: number;
  lastUpdated: string;
  seatCounts: AerolopaSeatCounts;
  canvas: AerolopaCanvas;
  assets: AerolopaAssets;
  cabins: AerolopaCabin[];
  seats: AerolopaSeat[];
}

export interface AerolopaConfiguration {
  slug: string;
  airlineIata: string;
  aircraftIata: string;
}

export interface AerolopaResolution {
  airlineIata: string;
  aircraftIata: string;
  candidateCount: number;
  ambiguous: boolean;
  candidates: string[];
  seatMaps: AerolopaSeatMap[];
}

export interface AerolopaSeatMapResponse {
  seatMap: AerolopaSeatMap;
}

export interface AerolopaConfigurationIndex {
  count: number;
  configurations: AerolopaConfiguration[];
}

export interface AerolopaErrorBody {
  error: {
    code: AerolopaErrorCode;
    message: string;
    status: number;
  };
}
