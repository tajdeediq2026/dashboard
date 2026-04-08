const LOCAL_DEV_BACKEND_BASE_URL = 'https://localhost:7065';
const LOCAL_DEV_HTTP_BACKEND_BASE_URL = 'http://localhost:5094';
const PRODUCTION_FALLBACK_BACKEND_BASE_URL = 'https://tajdeediq-001-site1.stempurl.com';

function normalizeBaseUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || /^(undefined|null)$/i.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);
    const normalizedPath = parsed.pathname.replace(/\/+$/, '');

    // Avoid accidental /api/api/* when env is set to .../api.
    if (normalizedPath === '/api') {
      parsed.pathname = '';
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getBackendBaseUrl(): string {
  return getBackendBaseUrlCandidates()[0] ?? PRODUCTION_FALLBACK_BACKEND_BASE_URL;
}

export function getBackendBaseUrlCandidates(): string[] {
  const candidates: string[] = [];
  const enableLocalFallback = (process.env.ENABLE_LOCAL_BACKEND_FALLBACK ?? '').trim().toLowerCase() === 'true';
  const pushUnique = (value: string | null) => {
    if (!value) return;
    if (candidates.some((existing) => existing.toLowerCase() === value.toLowerCase())) return;
    candidates.push(value);
  };

  // Explicit server-side override first.
  pushUnique(normalizeBaseUrl(process.env.BACKEND_BASE_URL ?? ''));

  // Public API URL is commonly configured in .env.local for dashboard development.
  pushUnique(normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? ''));

  if (process.env.NODE_ENV === 'development' && enableLocalFallback) {
    // Opt-in local fallback for development only.
    pushUnique(LOCAL_DEV_BACKEND_BASE_URL);
    pushUnique(LOCAL_DEV_HTTP_BACKEND_BASE_URL);
  }

  // Always keep production fallback last in case env values are missing.
  pushUnique(PRODUCTION_FALLBACK_BACKEND_BASE_URL);

  return candidates;
}
