import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'node:https';
import { randomUUID } from 'node:crypto';

interface TokenCache {
  token: string;
  expiresAt: number;
}

// Module-level cache persists between warm serverless invocations
const tokenCache = new Map<string, TokenCache>();

function httpsPost(options: https.RequestOptions, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { ...options, headers: { ...options.headers, 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => resolve(data));
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getToken(credentials: string, scope: string): Promise<string> {
  const cacheKey = `${credentials}:${scope}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const raw = await httpsPost(
    {
      hostname: 'ngw.devices.sberbank.ru',
      port: 9443,
      path: '/api/v2/oauth',
      method: 'POST',
      rejectUnauthorized: false, // Sber CA not in default trust store
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'RqUID': randomUUID(),
        'Accept': 'application/json',
      },
    },
    `scope=${scope}`,
  );

  const json = JSON.parse(raw) as { access_token?: string; expires_at?: number; message?: string };
  if (!json.access_token) throw new Error(json.message ?? 'Failed to obtain access token');

  tokenCache.set(cacheKey, {
    token: json.access_token,
    expiresAt: json.expires_at ?? Date.now() + 30 * 60 * 1000,
  });

  return json.access_token;
}

interface ChatRequestBody {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
  credentials?: string;
  scope?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    messages = [],
    model = 'GigaChat',
    temperature = 0.7,
    topP = 0.9,
    maxTokens = 1024,
    systemPrompt,
    credentials: clientCredentials,
    scope: clientScope,
  } = req.body as ChatRequestBody;

  const credentials = process.env.GIGACHAT_CREDENTIALS ?? clientCredentials;
  const scope = process.env.GIGACHAT_SCOPE ?? clientScope ?? 'GIGACHAT_API_PERS';

  if (!credentials) {
    return res.status(400).json({ error: 'Credentials не указаны. Укажите GIGACHAT_CREDENTIALS в переменных окружения или введите credentials при входе.' });
  }

  try {
    const token = await getToken(credentials, scope);

    const chatMessages = [];
    if (systemPrompt) chatMessages.push({ role: 'system', content: systemPrompt });
    chatMessages.push(...messages);

    const gigachatRes = await fetch(
      'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ model, messages: chatMessages, temperature, top_p: topP, max_tokens: maxTokens, stream: false }),
      },
    );

    if (!gigachatRes.ok) {
      const err = await gigachatRes.json() as { message?: string };
      return res.status(gigachatRes.status).json({ error: err.message ?? 'GigaChat API error' });
    }

    const data = await gigachatRes.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ content });
  } catch (err) {
    console.error('GigaChat proxy error:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}