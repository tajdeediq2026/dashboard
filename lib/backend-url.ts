const FALLBACK_BACKEND_BASE_URL = 'https://tajdeediq-001-site1.stempurl.com';

export function getBackendBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  const candidate = raw && !/^(undefined|null)$/i.test(raw)
    ? raw
    : FALLBACK_BACKEND_BASE_URL;

  try {
    const parsed = new URL(candidate);
    const normalizedPath = parsed.pathname.replace(/\/+$/, '');

    // Avoid accidental /api/api/* when env is set to .../api.
    if (normalizedPath === '/api') {
      parsed.pathname = '';
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_BACKEND_BASE_URL;
  }
}
