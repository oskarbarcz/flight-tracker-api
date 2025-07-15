import { Then } from '@cucumber/cucumber';
import { deepCompare } from '../_helper/deep-compare';
import * as fs from 'node:fs';
import * as path from 'node:path';

Then(
  'ADSB service was requested for callsign {string} and returned data:',
  (callsign: string, body: string) => {
    const expected = JSON.parse(body);
    const filePath = path.join(
      process.cwd(),
      'test-data',
      'adsb',
      `${callsign}.json`,
    );
    const actual = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    deepCompare(actual, expected);
  },
);
