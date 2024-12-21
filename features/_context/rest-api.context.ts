import { When, Then, Given, After } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import expect from 'expect';
import { execSync } from 'child_process';
import { deepCompare } from '../_helper/deep-compare';

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
};

const apiBaseUrl = 'http://localhost:3000';
let apiToken = '';
let apiResponse: AxiosResponse;

Given('I use seed data', () => {
  execSync('npx prisma migrate reset --force --skip-generate > /dev/null');
});

Given(
  'I am signed in as {string}',
  async (role: 'admin' | 'operations' | 'cabin crew') => {
    const user = apiUsers[role];
    const url = `${apiBaseUrl}/api/v1/auth/sign-in`;
    apiResponse = (await axios.post(url, user)) as AxiosResponse<{
      token: string;
    }>;

    apiToken = apiResponse.data.token;
  },
);

When(
  'I send a {string} request to {string}',
  async (method: string, path: string) => {
    const url = `${apiBaseUrl}${path}`;
    apiResponse = await axios.request({
      method: method,
      url: url,
      validateStatus: () => true,
      headers: apiToken === '' ? {} : { Authorization: `Bearer ${apiToken}` },
    });
  },
);

When(
  'I send a {string} request to {string} with body:',
  async (method: string, path: string, body: string) => {
    const url = `${apiBaseUrl}${path}`;
    apiResponse = await axios.request({
      method: method,
      url: url,
      data: JSON.parse(body),
      validateStatus: () => true,
      headers: apiToken === '' ? {} : { Authorization: `Bearer ${apiToken}` },
    });
  },
);

Then('the response status should be {int}', (statusCode: number) => {
  expect(apiResponse.status).toBe(statusCode);
});

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
  apiToken = '';
});
