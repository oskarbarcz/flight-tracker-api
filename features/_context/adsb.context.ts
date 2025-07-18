import { Then } from '@cucumber/cucumber';
import { deepCompare } from '../_helper/deep-compare';
import * as fs from 'node:fs';
import * as path from 'node:path';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

Then(
  'ADSB repository was requested for callsign {string} and returned data:',
  async (callsign: string, body: string) => {
    const expected = JSON.parse(body);
    const filePath = path.join(
      process.cwd(),
      'test-data',
      'adsb',
      `${callsign}.json`,
    );
    await delay(1000);
    const actual = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    deepCompare(actual, expected);
  },
);
