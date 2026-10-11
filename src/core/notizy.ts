import { version } from '../../package.json';
import { ApiKeys } from '../api-keys/api-keys';
import { Broadcasts } from '../broadcasts/broadcasts';
import { Contacts } from '../contacts/contacts';
import { Media } from '../media/media';
import { Messages } from '../messages/messages';
import { errorNameFromStatus } from '../types/error';
import type { GetOptions } from '../types/get-options';
import type { ErrorResponse, Response } from '../types/http';
import type { IdempotentRequest } from '../types/idempotent-request';
import type { PatchOptions } from '../types/patch-options';
import type { PostOptions } from '../types/post-options';
import type { PutOptions } from '../types/put-options';
import { withQuery } from '../utils/build-query';
import { Webhooks } from '../webhooks/webhooks';
import { Whatsapp } from '../whatsapp/whatsapp';
import type { NotizyOptions } from './types';

const defaultBaseUrl = 'https://api.notizy.id';
const defaultUserAgent = `notizy-sdk-nodejs/${version}`;

const baseUrl =
  typeof process !== 'undefined' && process.env
    ? process.env.NOTIZY_BASE_URL || defaultBaseUrl
    : defaultBaseUrl;

const userAgent =
  typeof process !== 'undefined' && process.env
    ? process.env.NOTIZY_USER_AGENT || defaultUserAgent
    : defaultUserAgent;

export class Notizy {
  readonly key: string;
  private readonly headers: Headers;
  private baseUrl: string = baseUrl;

  readonly apiKeys = new ApiKeys(this);
  readonly whatsapp = new Whatsapp(this);
  readonly messages = new Messages(this);
  readonly media = new Media(this);
  readonly contacts = new Contacts(this);
  readonly broadcasts = new Broadcasts(this);
  readonly webhooks = new Webhooks();

  constructor(key: string, options?: NotizyOptions) {
    this.key = key;
    if (options?.baseUrl) {
      this.baseUrl = options.baseUrl;
    }

    if (!this.key) {
      throw new Error(
        'Missing API key. Pass it to the constructor `new Notizy("n_xxxxxxx")`',
      );
    }

    this.headers = new Headers({
      'X-Api-Key': `${this.key}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json',
    });
  }

  async fetchRequest<T>(path: string, options = {}): Promise<Response<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, options);

      if (!response.ok) {
        const headers = Object.fromEntries(response.headers.entries());
        const raw = await response.text().catch(() => '');
        let body: Record<string, unknown> | null = null;
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed === 'object') body = parsed;
        } catch {
          // not JSON (proxy error page, plain-text error)
        }
        const message =
          typeof body?.message === 'string'
            ? body.message
            : response.status >= 500 || !raw
              ? 'Internal server error. We are unable to process your request right now, please try again later.'
              : raw;
        return {
          data: null,
          // the API sends { message, errors?, request_id? }: add the status
          // and a stable name so callers can branch on them
          error: {
            ...body,
            name:
              (body?.name as ErrorResponse['name'] | undefined) ??
              errorNameFromStatus(response.status),
            statusCode: response.status,
            message,
          },
          headers,
        };
      }

      const data = await response.json();
      return {
        data,
        error: null,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch {
      return {
        data: null,
        error: {
          name: 'application_error',
          statusCode: null,
          message: 'Unable to fetch data. The request could not be resolved.',
        },
        headers: null,
      };
    }
  }

  async post<T>(
    path: string,
    entity?: unknown,
    options: PostOptions & IdempotentRequest = {},
  ) {
    const headers = new Headers(this.headers);
    if (options.headers) {
      for (const [key, value] of new Headers(options.headers).entries()) {
        headers.set(key, value);
      }
    }
    if (options.idempotencyKey) {
      headers.set('Idempotency-Key', options.idempotencyKey);
    }
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(entity),
      ...options,
      headers,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async get<T>(path: string, options: GetOptions = {}) {
    const { query, ...rest } = options;
    const headers = new Headers(this.headers);
    if (rest.headers) {
      for (const [key, value] of new Headers(rest.headers).entries()) {
        headers.set(key, value);
      }
    }
    const requestOptions = {
      method: 'GET',
      ...rest,
      headers,
    };

    return this.fetchRequest<T>(withQuery(path, query), requestOptions);
  }

  /** multipart/form-data POST; fetch sets the Content-Type boundary. */
  async postForm<T>(path: string, form: FormData) {
    const headers = new Headers(this.headers);
    headers.delete('Content-Type');
    return this.fetchRequest<T>(path, { method: 'POST', body: form, headers });
  }

  async put<T>(path: string, entity: unknown, options: PutOptions = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) {
      for (const [key, value] of new Headers(options.headers).entries()) {
        headers.set(key, value);
      }
    }
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(entity),
      ...options,
      headers,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async patch<T>(path: string, entity: unknown, options: PatchOptions = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) {
      for (const [key, value] of new Headers(options.headers).entries()) {
        headers.set(key, value);
      }
    }
    const requestOptions = {
      method: 'PATCH',
      body: JSON.stringify(entity),
      ...options,
      headers,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async delete<T>(path: string, query?: unknown) {
    const requestOptions = {
      method: 'DELETE',
      body: JSON.stringify(query),
      headers: this.headers,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }
}
