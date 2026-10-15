// Turns a station name into a URL-safe code, for example "Kigali Central Hub" -> "kigali-central-hub".
export function slugify(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'station';
}
