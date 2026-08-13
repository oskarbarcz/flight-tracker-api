import { Then } from '@cucumber/cucumber';
import * as fs from 'node:fs';
import * as path from 'node:path';
import expect from 'expect';

// Some lifecycle events are emitted fire-and-forget, so the HTTP response can
// land before the Discord listener has written its file. Poll briefly rather
// than reading once, the same tolerance the websocket steps allow themselves.
const DELIVERY_TIMEOUT_MS = 2000;
const POLL_INTERVAL_MS = 50;

function messagePath(type: string, flightId: string): string {
  return path.join(
    process.cwd(),
    'test-data',
    'discord',
    `${type}_${flightId}.md`,
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readWhenDelivered(filePath: string): Promise<string> {
  const deadline = Date.now() + DELIVERY_TIMEOUT_MS;

  do {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }

    await wait(POLL_INTERVAL_MS);
  } while (Date.now() < deadline);

  return fs.readFileSync(filePath, 'utf8');
}

Then(
  'I see Discord {string} message for flight {string} containing {string}',
  async (type: string, flightId: string, fragment: string) => {
    const fileContent = await readWhenDelivered(messagePath(type, flightId));
    expect(fileContent).toContain(fragment);
  },
);

Then(
  'I see no Discord {string} message for flight {string}',
  async (type: string, flightId: string) => {
    await wait(DELIVERY_TIMEOUT_MS);

    expect(fs.existsSync(messagePath(type, flightId))).toBe(false);
  },
);

Then('I clear Discord messages directory', async () => {
  fs.rmSync(path.join(process.cwd(), 'test-data', 'discord'), {
    force: true,
    recursive: true,
  });
});
