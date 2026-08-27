export type PostcardFormat = 'jpeg' | 'png';

export type PostcardQuality = 'auto' | 'low' | 'medium' | 'high';

export type PostcardRequest = {
  city: string;
  uuid: string;
  size?: string;
  quality?: PostcardQuality;
  format?: PostcardFormat;
};

export type PostcardGeneratedBody = {
  city: string;
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
};

export type PostcardErrorCode = 'BAD_REQUEST';

export type PostcardErrorBody = {
  error: {
    code: PostcardErrorCode;
    message: string;
    status: number;
  };
};

export type PostcardArt = {
  key: string;
  url: string;
  confirmed: boolean;
};

export const POSTCARD_DEFAULTS = {
  size: '1152x1536',
  quality: 'high',
  format: 'jpeg',
} as const satisfies Required<Omit<PostcardRequest, 'city' | 'uuid'>>;

export const POSTCARD_FILE_EXTENSION: Record<PostcardFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
};

export const POSTCARD_KEY_PREFIX = 'postcards';
