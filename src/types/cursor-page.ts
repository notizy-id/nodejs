/** A page of a cursor-paginated list. */
export type CursorPage<T> = {
  data: T[];
  /** Pass as `cursor` to get the next page; null on the last page. */
  next_cursor: string | null;
};

export type CursorOptions = {
  /** `next_cursor` of the previous page. */
  cursor?: string;
  /** 1-100, default 30. */
  limit?: number;
};
