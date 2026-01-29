import { When, Then, Given, After } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import expect from 'expect';
import { deepCompare } from '../_helper/deep-compare';
import { SignInResponse } from '../../src/modules/auth/dto/sign-in.dto';
import * as http from 'node:http';
type ApiUserType =
  | 'admin'
  | 'operations'
  | 'operations with valid Simbrief ID'
  | 'operations with Simbrief ID but non existing aircraft'
  | 'cabin crew';

import * as https from 'node:https';

const apiUsers = {
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
  'operations with Simbrief ID but non existing aircraft': {
    email: 'claudia.doe@example.com',
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
} as Record<ApiUserType, { email: string; password: string }>;

const apiBaseUrl = 'http://localhost:3000';
let apiTokens = {
  admin: '',
  operations: '',
  'cabin crew': '',
  currentRole: 'admin',
} as Record<string, string>;
let apiResponse: AxiosResponse;

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  httpAgent,
  httpsAgent,
  validateStatus: () => true,
});

Given('I am signed in as {string}', async (role: ApiUserType) => {
  const credentials = apiUsers[role];
  const url = `${apiBaseUrl}/api/v1/auth/sign-in`;
  apiResponse = (await apiClient.post(
    url,
    credentials,
  )) as AxiosResponse<SignInResponse>;

  apiTokens[role] = (apiResponse.data as SignInResponse).accessToken;
  apiTokens.currentRole = role;
});

When(
  'I send a {string} request to {string}',
  async (method: string, path: string) => {
    const url = `${apiBaseUrl}${path}`;
    apiResponse = await apiClient.request({
      method: method,
      url: url,
      validateStatus: () => true,
      headers:
        apiTokens[apiTokens.currentRole] === ''
          ? {}
          : { Authorization: `Bearer ${apiTokens[apiTokens.currentRole]}` },
    });
  },
);

When(
  'I send a {string} request to {string} with body:',
  async (method: string, path: string, body: string) => {
    const url = `${apiBaseUrl}${path}`;
    apiResponse = await apiClient.request({
      method: method,
      url: url,
      data: JSON.parse(body),
      validateStatus: () => true,
      headers:
        apiTokens[apiTokens.currentRole] === ''
          ? {}
          : { Authorization: `Bearer ${apiTokens[apiTokens.currentRole]}` },
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

Then('the response body should contain:', async function (docString: string) {
  const expected = JSON.parse(docString);
  const actual = apiResponse.data;

  deepCompare(actual, expected);
});

Then('I dump response', () => {
  console.log(JSON.stringify(apiResponse.data));
});

After(() => {
  apiTokens = {
    admin: '',
    operations: '',
    'cabin crew': '',
    currentRole: 'admin',
  };
});
