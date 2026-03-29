// GigaChat API service
// Requests go through Vite proxy to avoid CORS and SSL issues

const OAUTH_URL = '/gigachat-oauth/api/v2/oauth';
const CHAT_URL = '/gigachat-api/api/v1/chat/completions';

export interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getAccessToken(
  credentials: string,
  scope: string
): Promise<{ token: string; expiresAt: number }> {
  const response = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      RqUID: crypto.randomUUID(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ scope }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ошибка авторизации (${response.status}): ${text}`);
  }

  const data = await response.json();
  return {
    token: data.access_token,
    expiresAt: data.expires_at,
  };
}

export interface SendMessageParams {
  token: string;
  messages: GigaChatMessage[];
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
}

export async function sendChatMessage(params: SendMessageParams): Promise<void> {
  const { token, messages, model, temperature, topP, maxTokens, signal, onChunk } = params;

  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ошибка API (${response.status}): ${text}`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  // Streaming (SSE) response
  if (contentType.includes('text/event-stream') && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content: string = parsed.choices?.[0]?.delta?.content ?? '';
          if (content) onChunk(content);
        } catch {
          // skip malformed chunk
        }
      }
    }
  } else {
    // Fallback: regular JSON response
    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';
    if (content) onChunk(content);
  }
}