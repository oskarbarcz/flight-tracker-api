import { Given, Then, When } from '@cucumber/cucumber';
import * as fs from 'node:fs';
import * as path from 'node:path';
import expect from 'expect';
import { sendApiRequest } from './rest-api.context';

// Mail is sent from a fire-and-forget listener, so a message can land shortly
// after the HTTP response the scenario already asserted on. Every read polls
// until what it looks for shows up; "no message" assertions wait out a fixed
// settle window instead, since absence cannot be observed by waiting longer.
const POLL_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 50;
const SETTLE_MS = 500;

const mailDir = path.join(process.cwd(), 'test-data', 'mail');

type SentMail = { subject: string; text: string };

function readMessage(file: string): SentMail | null {
  try {
    const raw = fs.readFileSync(file, 'utf8');

    return raw.length === 0 ? null : (JSON.parse(raw) as SentMail);
  } catch {
    return null;
  }
}

function messagesTo(address: string): SentMail[] {
  if (!fs.existsSync(mailDir)) {
    return [];
  }

  return fs
    .readdirSync(mailDir)
    .filter((name) => name.includes(`_${address}_`))
    .map((name) => readMessage(path.join(mailDir, name)))
    .filter((message): message is SentMail => message !== null);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function awaitMessagesTo(
  address: string,
  isSatisfied: (messages: SentMail[]) => boolean,
): Promise<SentMail[]> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const messages = messagesTo(address);

    if (isSatisfied(messages)) {
      return messages;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return messagesTo(address);
}

async function settledMessagesTo(address: string): Promise<SentMail[]> {
  await sleep(SETTLE_MS);

  return messagesTo(address);
}

Given('I clear sent emails directory', () => {
  fs.rmSync(mailDir, { force: true, recursive: true });
});

Then(
  'I see {int} email(s) sent to {string}',
  async (count: number, address: string) => {
    const messages =
      count === 0
        ? await settledMessagesTo(address)
        : await awaitMessagesTo(address, (found) => found.length >= count);

    expect(messages).toHaveLength(count);
  },
);

Then(
  'I see an email to {string} with subject {string}',
  async (address: string, subject: string) => {
    const messages = await awaitMessagesTo(address, (found) =>
      found.some((message) => message.subject === subject),
    );

    expect(messages.map((message) => message.subject)).toContain(subject);
  },
);

Then(
  'I see an email to {string} containing {string}',
  async (address: string, fragment: string) => {
    const messages = await awaitMessagesTo(address, (found) =>
      found.some((message) => message.text.includes(fragment)),
    );

    expect(messages.map((message) => message.text).join('\n')).toContain(
      fragment,
    );
  },
);

Then(
  'I see no email to {string} containing {string}',
  async (address: string, fragment: string) => {
    const messages = await settledMessagesTo(address);

    expect(messages.map((message) => message.text).join('\n')).not.toContain(
      fragment,
    );
  },
);

async function tokenFromLinkTo(address: string): Promise<string> {
  const messages = await awaitMessagesTo(address, (found) =>
    found.some((message) => message.text.includes('token=')),
  );
  const withLink = messages.filter((message) =>
    message.text.includes('token='),
  );
  expect(withLink).toHaveLength(1);

  const match = /token=([A-Za-z0-9_-]+)/.exec(withLink[0].text);
  expect(match).not.toBeNull();

  return (match as RegExpExecArray)[1];
}

When(
  'I send a {string} request to {string} with the token from the email to {string}',
  async (method: string, requestPath: string, address: string) => {
    await sendApiRequest(method, requestPath, {
      token: await tokenFromLinkTo(address),
    });
  },
);

When(
  'I send a {string} request to {string} with the token from the email to {string} and body:',
  async (
    method: string,
    requestPath: string,
    address: string,
    body: string,
  ) => {
    await sendApiRequest(method, requestPath, {
      ...(JSON.parse(body) as Record<string, unknown>),
      token: await tokenFromLinkTo(address),
    });
  },
);
