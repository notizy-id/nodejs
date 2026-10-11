export type NOTIZY_ERROR_CODE_KEY =
  | 'application_error'
  | 'validation_error'
  | 'invalid_api_key'
  | 'invalid_access'
  | 'not_found'
  | 'conflict'
  | 'plan_limit_exceeded'
  | 'rate_limit_exceeded';

/** HTTP status → error name (the API itself only sends `message`). */
export const errorNameFromStatus = (status: number): NOTIZY_ERROR_CODE_KEY => {
  if (status === 400 || status === 422) return 'validation_error';
  if (status === 401) return 'invalid_api_key';
  if (status === 402) return 'plan_limit_exceeded';
  if (status === 403) return 'invalid_access';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limit_exceeded';
  return 'application_error';
};
