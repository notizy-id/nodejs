import type { Notizy } from '../core/notizy';
import { buildPaginationQuery } from '../utils/build-pagination-query';
import type {
  CreateApiKeyOptions,
  CreateApiKeyRequestOptions,
  CreateApiKeyResponse,
  CreateApiKeyResponseSuccess,
} from './types/create-api-keys';
import type {
  ListApiKeysOptions,
  ListApiKeysResponse,
  ListApiKeysResponseSuccess,
} from './types/list-api-keys';
import type {
  RemoveApiKeyResponse,
  RemoveApiKeyResponseSuccess,
} from './types/remove-api-keys';

export class ApiKeys {
  constructor(private readonly notizy: Notizy) {}

  async create(
    payload: CreateApiKeyOptions,
    options: CreateApiKeyRequestOptions = {},
  ): Promise<CreateApiKeyResponse> {
    const data = await this.notizy.post<CreateApiKeyResponseSuccess>(
      '/api-keys',
      payload,
      options,
    );

    return data;
  }

  async list(options: ListApiKeysOptions = {}): Promise<ListApiKeysResponse> {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/api-keys?${queryString}` : '/api-keys';

    const data = await this.notizy.get<ListApiKeysResponseSuccess>(url);
    return data;
  }

  async remove(id: string): Promise<RemoveApiKeyResponse> {
    const data = await this.notizy.delete<RemoveApiKeyResponseSuccess>(
      `/api-keys/${id}`,
    );
    return data;
  }
}
