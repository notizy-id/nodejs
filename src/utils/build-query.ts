/** Query string (without '?') from an object, skipping undefined values. */
export function buildQuery(
  query: Record<string, string | number | boolean | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return params.toString();
}

export const withQuery = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) => {
  const qs = buildQuery(query);
  return qs ? `${path}?${qs}` : path;
};
