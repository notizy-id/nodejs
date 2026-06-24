import { version } from '../../package.json';
import { ApiKeys } from '../api-keys/api-keys';
import type { GetOptions } from '../types/get-options';
import type { ErrorResponse, Response } from '../types/http';
import type { IdempotentRequest } from '../types/idempotent-request';
import type { PatchOptions } from '../types/patch-options';
import type { PostOptions } from '../types/post-options';
import type { PutOptions } from '../types/put-options';
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
        try {
          const rawError = await response.text();
          return {
            data: null,
            error: JSON.parse(rawError),
            headers: Object.fromEntries(response.headers.entries()),
          };
        } catch (err) {
          if (err instanceof SyntaxError) {
            return {
              data: null,
              error: {
                name: 'application_error',
                statusCode: response.status,
                message:
                  'Internal server error. We are unable to process your request right now, please try again later.',
              },
              headers: Object.fromEntries(response.headers.entries()),
            };
          }

          const error: ErrorResponse = {
            message: response.statusText,
            statusCode: response.status,
            name: 'application_error',
          };

          if (err instanceof Error) {
            return {
              data: null,
              error: { ...error, message: err.message },
              headers: Object.fromEntries(response.headers.entries()),
            };
          }

          return {
            data: null,
            error,
            headers: Object.fromEntries(response.headers.entries()),
          };
        }
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
    const headers = new Headers(this.headers);
    if (options.headers) {
      for (const [key, value] of new Headers(options.headers).entries()) {
        headers.set(key, value);
      }
    }
    const requestOptions = {
      method: 'GET',
      ...options,
      headers,
    };

    return this.fetchRequest<T>(path, requestOptions);
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
