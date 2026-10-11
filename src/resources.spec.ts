import createFetchMock from 'vitest-fetch-mock';
import { Notizy } from './core/notizy';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

const notizy = new Notizy('nzy_test', { baseUrl: 'https://api.test' });

const lastRequest = () => {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]!;
  const body = init?.body;
  return {
    url: String(url),
    method: init?.method,
    headers: new Headers(init?.headers),
    body:
      typeof body === 'string' ? JSON.parse(body) : (body as FormData | null),
  };
};

beforeEach(() => {
  fetchMock.resetMocks();
  fetchMock.mockResponse(() => JSON.stringify({}));
});
afterAll(() => fetchMocker.disableMocks());

describe('messages', () => {
  it('list() sends filters and cursor as query, skipping undefined', async () => {
    await notizy.messages.list({
      direction: 'inbound',
      since: '2026-10-01T00:00:00Z',
      cursor: 'abc',
      limit: 50,
      status: undefined,
    });
    expect(lastRequest().url).toBe(
      'https://api.test/v1/messages?direction=inbound&since=2026-10-01T00%3A00%3A00Z&cursor=abc&limit=50',
    );
  });

  it('get() encodes the id', async () => {
    await notizy.messages.get('wamid/1');
    expect(lastRequest().url).toBe('https://api.test/v1/messages/wamid%2F1');
  });
});

describe('media', () => {
  it('upload() posts multipart without a JSON content type', async () => {
    await notizy.media.upload({
      account_id: 'acc',
      file: new Blob(['%PDF'], { type: 'application/pdf' }),
      filename: 'invoice.pdf',
    });
    const req = lastRequest();
    expect(req.url).toBe('https://api.test/v1/media');
    expect(req.method).toBe('POST');
    expect(req.headers.get('Content-Type')).toBeNull();
    const form = req.body as FormData;
    expect(form.get('account_id')).toBe('acc');
    expect((form.get('file') as File).name).toBe('invoice.pdf');
  });
});

describe('contacts', () => {
  it('list() joins tags and stringifies subscribed', async () => {
    await notizy.contacts.list({ tags: ['vip', 'jkt'], subscribed: false });
    expect(lastRequest().url).toBe(
      'https://api.test/v1/contacts?tags=vip%2Cjkt&subscribed=false',
    );
  });

  it('upsert / update / remove / updateTags / optOut', async () => {
    await notizy.contacts.upsert({ phone: '0812', name: 'John' });
    expect(lastRequest()).toMatchObject({
      method: 'POST',
      url: 'https://api.test/v1/contacts',
      body: { phone: '0812', name: 'John' },
    });

    await notizy.contacts.update('c1', { tags: ['a'] });
    expect(lastRequest()).toMatchObject({
      method: 'PATCH',
      url: 'https://api.test/v1/contacts/c1',
      body: { tags: ['a'] },
    });

    await notizy.contacts.remove('c1');
    expect(lastRequest()).toMatchObject({
      method: 'DELETE',
      url: 'https://api.test/v1/contacts/c1',
    });

    await notizy.contacts.updateTags('c1', { add: ['x'], remove: ['y'] });
    expect(lastRequest()).toMatchObject({
      method: 'POST',
      url: 'https://api.test/v1/contacts/c1/tags',
      body: { add: ['x'], remove: ['y'] },
    });

    await notizy.contacts.optOut('c1');
    expect(lastRequest().body).toEqual({ opted_out: true });
    await notizy.contacts.optOut('c1', false);
    expect(lastRequest()).toMatchObject({
      url: 'https://api.test/v1/contacts/c1/opt-out',
      body: { opted_out: false },
    });
  });
});

describe('broadcasts', () => {
  it('create / list / get / cancel', async () => {
    const payload = {
      account_id: 'acc',
      template: { name: 'promo', language: 'id' },
      audience: { tags_any: ['customer'] },
      variables: {
        body_1: { source: 'contact' as const, field: 'name' as const },
      },
    };
    await notizy.broadcasts.create(payload);
    expect(lastRequest()).toMatchObject({
      method: 'POST',
      url: 'https://api.test/v1/broadcasts',
      body: payload,
    });

    await notizy.broadcasts.list({ status: 'RUNNING', limit: 10 });
    expect(lastRequest().url).toBe(
      'https://api.test/v1/broadcasts?status=RUNNING&limit=10',
    );

    await notizy.broadcasts.get('b1');
    expect(lastRequest()).toMatchObject({
      method: 'GET',
      url: 'https://api.test/v1/broadcasts/b1',
    });

    await notizy.broadcasts.cancel('b1');
    expect(lastRequest()).toMatchObject({
      method: 'POST',
      url: 'https://api.test/v1/broadcasts/b1/cancel',
    });
  });
});
