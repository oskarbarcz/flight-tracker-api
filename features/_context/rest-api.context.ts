import { When, Then, Given, After } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import expect from 'expect';
import { deepCompare } from '../_helper/deep-compare';
import { SignInResponse } from '../../src/modules/auth/infra/http/request/sign-in.dto';
import * as http from 'node:http';
import * as https from 'node:https';

export type ApiUserType =
  | 'admin'
  | 'operations'
  | 'operations with valid Simbrief ID'
  | 'operations with Simbrief ID but empty etops'
  | 'operations with Simbrief ID but non existing aircraft'
  | 'operations with Simbrief ID and alternate airport missing from database'
  | 'cabin crew'
  | 'Alan Doe'
  | 'Michael Doe';

const apiUsers: Record<ApiUserType, { email: string; password: string }> = {
  admin: {
    email: 'admin@example.com',
    password: 'P@$$w0rd',
  },
  operations: {
    email: 'operations@example.com',
    password: 'P@$$w0rd',
  },
  'cabin crew': {
    email: 'cabin-crew@example.com',
    password: 'P@$$w0rd',
  },
  'operations with valid Simbrief ID': {
    email: 'abby.doe@example.com',
    password: 'P@$$w0rd',
  },
  'operations with Simbrief ID but empty etops': {
    email: 'emma.doe@example.com',
    password: 'P@$$w0rd',
  },
  'operations with Simbrief ID but non existing aircraft': {
    email: 'claudia.doe@example.com',
    password: 'P@$$w0rd',
  },
  'operations with Simbrief ID and alternate airport missing from database': {
    email: 'diana.doe@example.com',
    password: 'P@$$w0rd',
  },
  'Alan Doe': {
    email: 'alan.doe@example.com',
    password: 'P@$$w0rd',
  },
  'Michael Doe': {
    email: 'michael.doe@example.com',
    password: 'P@$$w0rd',
  },
};

const apiBaseUrl = 'http://localhost:3000';

const ACCESS_TOKEN_REUSE_WINDOW_MS = 8 * 60 * 1000;

type MintedAccessToken = { accessToken: string; mintedAt: number };

const accessTokens = new Map<ApiUserType, MintedAccessToken>();

let bearerToken: string | null = null;
let apiResponse: AxiosResponse;

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  httpAgent,
  httpsAgent,
  validateStatus: () => true,
});

function signIn(user: ApiUserType): Promise<AxiosResponse<SignInResponse>> {
  return apiClient.post<SignInResponse>(
    `${apiBaseUrl}/api/v1/auth/sign-in`,
    apiUsers[user],
  );
}

export async function accessTokenFor(user: ApiUserType): Promise<string> {
  const minted = accessTokens.get(user);

  if (
    minted !== undefined &&
    Date.now() - minted.mintedAt < ACCESS_TOKEN_REUSE_WINDOW_MS
  ) {
    return minted.accessToken;
  }

  const { accessToken } = (await signIn(user)).data;
  accessTokens.set(user, { accessToken, mintedAt: Date.now() });

  return accessToken;
}

export async function sendApiRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<void> {
  apiResponse = await apiClient.request({
    method: method,
    url: `${apiBaseUrl}${path}`,
    data: body,
    validateStatus: () => true,
    headers:
      bearerToken === null ? {} : { Authorization: `Bearer ${bearerToken}` },
  });
}

Given('I am signed in as {string}', async (user: ApiUserType) => {
  bearerToken = await accessTokenFor(user);
});

Given(
  'I am signed in with Google using ID token {string}',
  async (idToken: string) => {
    const url = `${apiBaseUrl}/api/v1/auth/google`;
    apiResponse = (await apiClient.post(url, {
      idToken,
    })) as AxiosResponse<SignInResponse>;

    bearerToken = (apiResponse.data as SignInResponse).accessToken;
  },
);

Given('I hold a refresh token as {string}', async (user: ApiUserType) => {
  apiResponse = await signIn(user);

  bearerToken = (apiResponse.data as SignInResponse).refreshToken;
});

When(
  'I send a {string} request to {string}',
  async (method: string, path: string) => {
    await sendApiRequest(method, path);
  },
);

When(
  'I send a {string} request to {string} with body:',
  async (method: string, path: string, body: string) => {
    await sendApiRequest(method, path, JSON.parse(body));
  },
);

When(
  'I send a {string} request to {string} with bearer token {string}',
  async (method: string, path: string, token: string) => {
    const url = `${apiBaseUrl}${path}`;
    apiResponse = await apiClient.request({
      method: method,
      url: url,
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${token}` },
    });
  },
);

Then('the response status should be {int}', (statusCode: number) => {
  expect(apiResponse.status).toBe(statusCode);
});

Then(
  'the response header {string} should be {string}',
  (header: string, value: string) => {
    expect(apiResponse.headers[header.toLowerCase()]).toBe(value);
  },
);

Then(
  'the response body should have the property {string}',
  (property: string) => {
    expect(apiResponse.data).toHaveProperty(property);
  },
);

Then('the response body should be empty', () => {
  expect(apiResponse.data).toBe('');
});

Then('the response body should contain:', async function (docString: string) {
  const expected = JSON.parse(docString);
  const actual = apiResponse.data;

  deepCompare(actual, expected);
});

Then(
  'the response body list {string} should have distinct {string} values',
  (listProperty: string, itemProperty: string) => {
    const items = itemsOf(listProperty);
    const values = items.map((item) => item[itemProperty]);

    expect(new Set(values).size).toBe(values.length);
  },
);

Then(
  'every entry of the response body list {string} should have a {string}',
  (listProperty: string, itemProperty: string) => {
    const items = itemsOf(listProperty);
    const missing = items.filter(
      (item) => item[itemProperty] === undefined || item[itemProperty] === '',
    );

    expect(missing).toEqual([]);
    expect(items.length).toBeGreaterThan(0);
  },
);

Then(
  'between {int} and {int} entries of the response body list {string} should have a {string}',
  (least: number, most: number, listProperty: string, itemProperty: string) => {
    const carrying = itemsOf(listProperty).filter(
      (item) => item[itemProperty] !== null && item[itemProperty] !== undefined,
    );

    expect(carrying.length).toBeGreaterThanOrEqual(least);
    expect(carrying.length).toBeLessThanOrEqual(most);
  },
);

Then(
  'every {string} of the response body list {string} should be one of {string}',
  (itemProperty: string, listProperty: string, allowed: string) => {
    const permitted = allowed.split(',').map((value) => value.trim());
    const unexpected = itemsOf(listProperty)
      .map((item) => item[itemProperty])
      .filter((value) => value !== null && value !== undefined)
      .filter((value) => !permitted.includes(value as string));

    expect(unexpected).toEqual([]);
  },
);

function itemsOf(listProperty: string): Record<string, any>[] {
  const items = apiResponse.data[listProperty];

  expect(Array.isArray(items)).toBe(true);

  return items;
}

Then('I dump response', () => {
  console.log(JSON.stringify(apiResponse.data));
});

After(() => {
  bearerToken = null;
});
