import type { Response } from '../../types/http';
import type { PaginationOptions } from '../../types/pagintaion-options';
import type { ApiKey } from './api-key';

export type ListApiKeysOptions = PaginationOptions;

export type ListApiKeysResponseSuccess = {
  object: 'list';
  has_more: boolean;
  data: Pick<ApiKey, 'name' | 'id' | 'created_at' | 'last_used_at'>[];
};

export type ListApiKeysResponse = Response<ListApiKeysResponseSuccess>;
