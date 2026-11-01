export enum SessionClient {
  Web = 'web',
  Transponder = 'transponder',
}

export const SESSION_CLIENT_NAMES: Record<SessionClient, string> = {
  [SessionClient.Web]: 'the browser',
  [SessionClient.Transponder]: 'the Transponder',
};
