import createFetchMock from 'vitest-fetch-mock';
import { Notizy } from './notizy';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

const notizy = new Notizy('nzy_test');

describe('errors', () => {
  afterEach(() => fetchMock.resetMocks());
  afterAll(() => fetchMocker.disableMocks());

  it.each([
    [400, 'validation_error'],
    [401, 'invalid_api_key'],
    [402, 'plan_limit_exceeded'],
    [404, 'not_found'],
    [409, 'conflict'],
    [422, 'validation_error'],
    [429, 'rate_limit_exceeded'],
    [500, 'application_error'],
  ])('%i → name %s, with statusCode and the API message', async (status, name) => {
    fetchMock.mockOnce(JSON.stringify({ message: 'nope' }), { status });
    const { data, error } = await notizy.messages.get('m1');
    expect(data).toBeNull();
    expect(error).toEqual({ name, statusCode: status, message: 'nope' });
  });

  it('keeps errors[] and request_id from the API', async () => {
    fetchMock.mockOnce(
      JSON.stringify({
        message: 'Template validation failed',
        errors: [{ field: 'body', message: 'Expected 2 values' }],
        request_id: 'req_1',
      }),
      { status: 422 },
    );
    const { error } = await notizy.messages.get('m1');
    expect(error).toEqual({
      name: 'validation_error',
      statusCode: 422,
      message: 'Template validation failed',
      errors: [{ field: 'body', message: 'Expected 2 values' }],
      request_id: 'req_1',
    });
  });

  it('non-JSON 5xx bodies get a generic message', async () => {
    fetchMock.mockOnce('<html>Bad gateway</html>', { status: 502 });
    const { error } = await notizy.messages.get('m1');
    expect(error?.statusCode).toBe(502);
    expect(error?.name).toBe('application_error');
    expect(error?.message).toMatch(/Internal server error/);
  });

  it('network failures are an application_error without status', async () => {
    fetchMock.mockRejectOnce(new Error('ECONNRESET'));
    const { error } = await notizy.messages.get('m1');
    expect(error).toMatchObject({
      name: 'application_error',
      statusCode: null,
    });
  });
});
