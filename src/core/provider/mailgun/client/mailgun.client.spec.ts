import * as path from 'path';
import { promises as fs } from 'fs';
import { MailgunClient, TestMailgunClient } from './mailgun.client';
import { MailMessage, MailMessageType } from '../types/mail.types';

const HOST = 'https://api.mailgun.net';
const DOMAIN = 'mg.example.com';
const API_KEY = 'key-1234';
const SENDER = 'Flight Tracker <no-reply@mg.example.com>';

function responseOf(status: number, statusText = ''): Response {
  return { ok: status >= 200 && status < 300, status, statusText } as Response;
}

const message: MailMessage = {
  to: 'pilot@example.com',
  subject: 'Reset your password',
  text: 'Open https://app.example.com/reset-password?token=abc',
  type: MailMessageType.PasswordReset,
};

describe('MailgunClient', () => {
  let client: MailgunClient;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    client = new MailgunClient(HOST, DOMAIN, API_KEY, SENDER);
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(responseOf(200));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts a form-encoded message to the domain messages endpoint', async () => {
    await client.send(message);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('https://api.mailgun.net/v3/mg.example.com/messages');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams(init.body as string);
    expect(Object.fromEntries(body)).toEqual({
      from: SENDER,
      to: 'pilot@example.com',
      subject: 'Reset your password',
      text: 'Open https://app.example.com/reset-password?token=abc',
    });
  });

  it('authenticates with basic credentials built from the api key', async () => {
    await client.send(message);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const { Authorization } = init.headers as Record<string, string>;

    expect(Authorization).toBe(
      `Basic ${Buffer.from('api:key-1234').toString('base64')}`,
    );
  });

  it('throws when Mailgun rejects the message', async () => {
    fetchMock.mockResolvedValue(responseOf(401, 'Unauthorized'));

    await expect(client.send(message)).rejects.toThrow(
      'Failed to send email: Unauthorized',
    );
  });
});

describe('TestMailgunClient', () => {
  const mailDir = path.join(process.cwd(), 'test-data', 'mail');
  const prefix = 'password_reset_pilot@example.com_';

  async function writtenFiles(): Promise<string[]> {
    const entries = await fs.readdir(mailDir);

    return entries.filter((name) => name.startsWith(prefix));
  }

  afterEach(async () => {
    for (const name of await writtenFiles()) {
      await fs.rm(path.join(mailDir, name), { force: true });
    }
    jest.restoreAllMocks();
  });

  it('writes the message to the mail directory instead of sending it', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const client = new TestMailgunClient(HOST, DOMAIN, API_KEY, SENDER);

    await client.send(message);

    expect(fetchMock).not.toHaveBeenCalled();
    const [name] = await writtenFiles();
    const written = JSON.parse(
      await fs.readFile(path.join(mailDir, name), 'utf-8'),
    );
    expect(written).toEqual({
      to: 'pilot@example.com',
      subject: 'Reset your password',
      text: 'Open https://app.example.com/reset-password?token=abc',
    });
  });

  it('writes one file per message so repeated sends stay visible', async () => {
    jest.spyOn(global, 'fetch');
    const client = new TestMailgunClient(HOST, DOMAIN, API_KEY, SENDER);

    await client.send(message);
    await client.send(message);

    expect(await writtenFiles()).toHaveLength(2);
  });
});
