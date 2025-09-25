export type ConversationTurn = { role: 'user' | 'agent'; content: string; };

export async function queryBedrock(prompt: string, history: ConversationTurn[] = []) {
  const url = import.meta.env.VITE_BEDROCK_API_URL as string | undefined;
  const apiKey = import.meta.env.VITE_BEDROCK_API_KEY as string | undefined;

  if (!url) {
    throw new Error('VITE_BEDROCK_API_URL is not set in the environment.');
  }

  const payload = { prompt, history };

  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bedrock API request failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = await res.json();

  // Common response shapes: { reply: '...' } or { message: '...' } or { result: '...' }
  const reply = json?.reply ?? json?.message ?? json?.result ?? (typeof json === 'string' ? json : undefined);

  if (!reply) throw new Error('Bedrock response did not contain a reply field.');

  return String(reply);
}
