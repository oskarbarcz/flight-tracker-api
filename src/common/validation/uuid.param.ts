import { Param, ParseUUIDPipe } from "@nestjs/common";

export const uuid = (name: string) =>
  Param(name, new ParseUUIDPipe({ version: '4' }));