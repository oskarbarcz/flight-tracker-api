import { Then } from '@cucumber/cucumber';
import * as fs from 'node:fs';
import * as path from 'node:path';
import expect from 'expect';

Then(
  'I see Discord {string} message for flight {string} containing {string}',
  async (type: string, flightId: string, fragment: string) => {
    const filePath = path.join(
      process.cwd(),
      'test-data',
      'discord',
      `${type}_${flightId}.md`,
    );
    const fileContent = fs.readFileSync(filePath, 'utf8');
    expect(fileContent).toContain(fragment);
  },
);

Then('I clear Discord messages directory', async () => {
  fs.rmSync(path.join(process.cwd(), 'test-data', 'discord'), {
    force: true,
    recursive: true,
  });
});
