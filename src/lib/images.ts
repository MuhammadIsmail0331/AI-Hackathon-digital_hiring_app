/**
 * Image validation helpers — data URLs are the storage format for all
 * user photos (compressed client-side). Keep limits tight.
 */
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_PHOTO_CHARS = 700_000; // ≈ 500 KB binary per photo

export function sanitizeImageList(input: unknown, max = 4): string[] | null {
  if (input === null || input === undefined) return null;
  if (!Array.isArray(input)) return null;
  const urls: string[] = [];
  for (const item of input) {
    if (typeof item !== "string" || item.length > MAX_PHOTO_CHARS || !DATA_URL_RE.test(item)) {
      return null; // reject the whole list on any bad entry
    }
    urls.push(item);
    if (urls.length >= max) break;
  }
  return urls;
}

export function sanitizeSingleImage(input: unknown): string | null {
  const list = sanitizeImageList([input], 1);
  return list ? (list[0] ?? null) : null;
}