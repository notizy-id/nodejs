import type { Response } from '../../types/http';

// biome-ignore lint/complexity/noBannedTypes: allow empty types
export type RemoveApiKeyResponseSuccess = {};

export type RemoveApiKeyResponse = Response<RemoveApiKeyResponseSuccess>;
