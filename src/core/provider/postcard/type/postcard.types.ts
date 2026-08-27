export type PostcardFormat = 'jpeg' | 'png';

export type PostcardQuality = 'auto' | 'low' | 'medium' | 'high';

export type PostcardRequest = {
  city: string;
  country: string;
  continent: string;
  uuid: string;
};

export type PostcardRenderSettings = {
  size: string;
  quality: PostcardQuality;
  format: PostcardFormat;
};

export type PostcardHandoffMode = 'activation' | 'web' | 'inline';

export type PostcardHandoff = {
  mode: PostcardHandoffMode;
  reason?: string;
};

export type PostcardAcceptedBody = {
  status: 'accepted';
  city: string;
  country: string;
  continent: string;
  uuid: string;
  size: string;
  quality: PostcardQuality;
  format: PostcardFormat;
  key: string;
  url: string;
  handoff?: PostcardHandoff;
};

export type PostcardGeneratedBody = {
  city: string;
  country: string;
  continent: string;
  uuid: string;
  model: string;
  size: string;
  quality: PostcardQuality;
  format: PostcardFormat;
  contentType: string;
  bytes: number;
  prompt: string;
  key: string;
  url: string;
  handoff?: PostcardHandoff;
};

export type PostcardErrorCode = 'BAD_REQUEST';

export type PostcardErrorBody = {
  error: {
    code: PostcardErrorCode;
    message: string;
    status: number;
  };
};

export type PostcardLocation = {
  key: string;
  url: string;
};

export type PostcardArt = PostcardLocation & {
  drawn: boolean;
};

export const POSTCARD_DEFAULTS = {
  size: '1152x1536',
  quality: 'high',
  format: 'jpeg',
} as const satisfies PostcardRenderSettings;

export const POSTCARD_FILE_EXTENSION: Record<PostcardFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
};

export const POSTCARD_KEY_PREFIX = 'postcards';

const [width, height] = POSTCARD_DEFAULTS.size.split('x').map(Number);

export const POSTCARD_DIMENSIONS = { width, height } as const;
