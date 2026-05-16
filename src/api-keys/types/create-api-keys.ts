import type { Response } from '../../types/http';
import type { PostOptions } from '../../types/post-options';

export interface CreateApiKeyOptions {
  name: string;
  permission?: 'full_access' | 'sending_access';
  domain_id?: string;
}

export interface CreateApiKeyRequestOptions extends PostOptions {}

export interface CreateApiKeyResponseSuccess {
  token: string;
  id: string;
}

export type CreateApiKeyResponse = Response<CreateApiKeyResponseSuccess>;
