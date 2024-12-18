import { When, Then, Given } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import { validate as isUuid } from 'uuid';
import expect from 'expect';
import { execSync } from 'child_process';

const apiBaseUrl = 'http://localhost:3000';
let apiResponse: AxiosResponse;

Given('I use seed data', () => {
  execSync(
    'npx prisma migrate reset --force --skip-generate --skip-seed > /dev/null',
    { stdio: 'inherit' },
  );
  execSync('npx prisma db seed > /dev/null', { stdio: 'inherit' });
});

When(
  'I send a {string} request to {string}',
  async (method: string, path: string) => {
    const url = `${apiBaseUrl}${path}`;
    apiResponse = await axios.request({
      method: method,
      url: url,
      validateStatus: () => true,
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

  for (const [key, value] of Object.entries(expected)) {
    expect(actual).toHaveProperty(key);
    if (value === '@uuid') {
      expect(isUuid(actual[key]));
    } else {
      expect(actual[key]).toStrictEqual(expected[key]);
    }
  }
});

Then('I dump response', () => {
  console.log(JSON.stringify(apiResponse.data));
});
