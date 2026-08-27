export type PostcardFormat = 'jpeg' | 'png';

export type PostcardQuality = 'auto' | 'low' | 'medium' | 'high';

export type PostcardRequest = {
  city: string;
  country: string;
  continent: string;
  uuid: string;
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
  width: number | null;
  height: number | null;
};

export const POSTCARD_KEY_PREFIX = 'postcards';

export const POSTCARD_ART_EXTENSION = 'jpg';
