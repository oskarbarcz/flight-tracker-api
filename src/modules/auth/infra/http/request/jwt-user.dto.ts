export enum JwtTokenType {
  Access = 'access',
  Refresh = 'refresh',
}

export type JwtUser = {
  sub: string;
  session: string;
  name: string;
  email: string;
  role: string;
  type: JwtTokenType;
};
