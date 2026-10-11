import type { NOTIZY_ERROR_CODE_KEY } from './error';

export type Response<T> = (
  | {
      data: T;
      error: null;
    }
  | { error: ErrorResponse; data: null }
) & {
  headers: Record<string, string> | null;
};

export type ErrorResponse = {
  message: string;
  statusCode: number | null;
  name: NOTIZY_ERROR_CODE_KEY;
  /** Field-level details, e.g. template variables that don't match. */
  errors?: { field: string; message: string }[];
  /** Server request id (500 errors); include it when contacting support. */
  request_id?: string;
};
