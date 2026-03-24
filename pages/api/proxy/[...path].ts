import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

// Simple server-side proxy that forwards requests to the configured backend API.
// Usage from client: fetch('/api/proxy/api/Tags') -> this route will forward to `${NEXT_PUBLIC_API_URL}/api/Tags`.

// Keep TLS bypass scoped to this proxy in non-production only.
const devHttpsAgent = process.env.NODE_ENV !== 'production'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = [] } = req.query as { path?: string | string[] };
  const pathStr = Array.isArray(path) ? path.join('/') : String(path || '');

  const targetBase = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
  const targetUrl = `${targetBase.replace(/\/$/, '')}/${pathStr}`;

  try {
    const method = req.method || 'GET';

    // Forward headers, but avoid forwarding host/connection headers that can cause issues
    // Normalize header names to lowercase so lookups are consistent.
    const forwardHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (v === undefined) continue;
      const key = k.toLowerCase();
      if (['host', 'connection', 'content-length'].includes(key)) continue;
      forwardHeaders[key] = Array.isArray(v) ? v.join(',') : String(v);
    }

    // Forward raw body as-is so multipart/form-data uploads work through proxy.
    let body: unknown = undefined;
    const isReadOnly = ['GET', 'HEAD'].includes(method.toUpperCase());

    if (!isReadOnly) {
      const rawBody = await readRawBody(req);
      if (rawBody.length > 0) {
        body = rawBody;
      }
    }

    console.log('[proxy] Forwarding request to:', targetUrl);
    console.log('[proxy] Request method:', method);
    console.log('[proxy] Request headers:', forwardHeaders);
    if (typeof body === 'string') {
      console.log('[proxy] Request body (truncated):', body.substring(0, 1000));
    }

    const response = await axios.request<ArrayBuffer>({
      url: targetUrl,
      method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
      headers: {
        ...forwardHeaders,
        Accept: forwardHeaders['accept'] || 'application/json'
      },
      data: body,
      timeout: 30000,
      validateStatus: () => true,
      responseType: 'arraybuffer',
      httpsAgent: devHttpsAgent
    });

    const responseHeaders = response.headers as Record<string, string | string[] | undefined>;
    const contentTypeHeaderValue = responseHeaders['content-type'];
    const contentType = Array.isArray(contentTypeHeaderValue)
      ? contentTypeHeaderValue.join('; ')
      : (contentTypeHeaderValue || '');
    const respBuffer = Buffer.isBuffer(response.data)
      ? response.data
      : Buffer.from(response.data || new ArrayBuffer(0));
    const respText = respBuffer.toString('utf8');

    console.log('[proxy] Backend response status:', response.status);
    console.log('[proxy] Backend response content-type:', contentType);
    if (respText && respText.length > 0) {
      console.log('[proxy] Backend response body (truncated):', respText.substring(0, 2000));
    }

    // Forward status and headers
    res.status(response.status);
    Object.entries(responseHeaders).forEach(([name, value]) => {
      // Avoid setting hop-by-hop headers
      if (['transfer-encoding', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'upgrade'].includes(name.toLowerCase())) return;
      if (value !== undefined) {
        res.setHeader(name, value);
      }
    });

    // If JSON, parse and send JSON
    if (contentType.includes('application/json')) {
      try {
        const data = JSON.parse(respText);
        res.json(data);
      } catch (err) {
        console.error('[proxy] Failed to parse JSON response from backend:', err);
        // If parsing fails, send raw text
        res.send(respText);
      }
      return;
    }

    // otherwise send raw text / binary payload
    res.send(respBuffer);
  } catch (unknownError) {
    if (axios.isAxiosError(unknownError) && unknownError.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Backend request timed out after 30 seconds' });
      return;
    }

    const err = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message || 'Proxy error' });
  }
}
