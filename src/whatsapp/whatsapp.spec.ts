import createFetchMock from 'vitest-fetch-mock';
import { Notizy } from '../core/notizy';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

const notizy = new Notizy('nzy_test', { baseUrl: 'https://api.test' });
const queued = {
  id: 'm1',
  status: 'PENDING',
  account_id: 'acc',
  from: '6281100000000',
  to: '6281234567890',
  created_at: '2026-10-11T00:00:00.000Z',
  conversation_id: 'c1',
};

const lastRequest = () => {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]!;
  return {
    url: String(url),
    method: init?.method,
    headers: new Headers(init?.headers),
    body: init?.body ? JSON.parse(String(init.body)) : undefined,
  };
};

describe('WhatsApp', () => {
  afterEach(() => fetchMock.resetMocks());
  afterAll(() => fetchMocker.disableMocks());

  it('send() posts the message with the Idempotency-Key', async () => {
    fetchMock.mockOnce(JSON.stringify(queued), { status: 201 });
    const { data, error } = await notizy.whatsapp.send(
      {
        account_id: 'acc',
        to: '6281234567890',
        type: 'text',
        text: { body: 'hi' },
      },
      { idempotencyKey: 'order-1' },
    );
    expect(error).toBeNull();
    expect(data).toEqual(queued);
    const req = lastRequest();
    expect(req.url).toBe('https://api.test/v1/whatsapp/messages');
    expect(req.method).toBe('POST');
    expect(req.headers.get('Idempotency-Key')).toBe('order-1');
    expect(req.headers.get('X-Api-Key')).toBe('nzy_test');
    expect(req.body).toEqual({
      account_id: 'acc',
      to: '6281234567890',
      type: 'text',
      text: { body: 'hi' },
    });
  });

  it('sendTemplate() adds type: template', async () => {
    fetchMock.mockOnce(JSON.stringify(queued), { status: 201 });
    await notizy.whatsapp.sendTemplate({
      account_id: 'acc',
      to: '6281234567890',
      template: { name: 'otp', language: 'id', body: ['123456'] },
    });
    expect(lastRequest().body).toEqual({
      account_id: 'acc',
      to: '6281234567890',
      type: 'template',
      template: { name: 'otp', language: 'id', body: ['123456'] },
    });
  });

  it('templates.list() and accounts.list() GET their endpoints', async () => {
    fetchMock.mockOnce(JSON.stringify({ data: [] }));
    await notizy.whatsapp.templates.list({ account_id: 'acc 1' });
    expect(lastRequest()).toMatchObject({
      method: 'GET',
      url: 'https://api.test/v1/whatsapp/templates?account_id=acc+1',
    });

    fetchMock.mockOnce(JSON.stringify({ data: [] }));
    await notizy.whatsapp.accounts.list();
    expect(lastRequest().url).toBe('https://api.test/v1/whatsapp/accounts');
  });
});
