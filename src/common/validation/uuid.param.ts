import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UuidParam = (name: string) =>
  Param(name, new ParseUUIDPipe({ version: '4' }));
