/** Web build is for development previews only; it uses localStorage. */
export const kv = {
  get: (key: string): string | null => globalThis.localStorage?.getItem(key) ?? null,
  set: (key: string, value: string): void => globalThis.localStorage?.setItem(key, value),
  remove: (key: string): void => globalThis.localStorage?.removeItem(key),
};
