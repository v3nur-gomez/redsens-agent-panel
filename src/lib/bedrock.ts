// Support two shapes: the existing { role: 'user'|'agent', content: string }
// and the newer `{ author: 'user'|'agent'|'whatever', text: string }` used elsewhere.
export type ConversationTurn = { role: "user" | "agent"; content: string };
export type LegacyConversationTurn = { author: string; text: string };

export async function queryBedrock(
  prompt: string,
  history: ConversationTurn[] = [],
  options?: {
    timeoutMs?: number;
    maxRetries?: number;
    max_tokens?: number;
    // Optional sensor values to send when calling /analyze
    temp?: number | null;
    level?: number | null;
  }
) {
  // Defaults and env overrides
  const defaultUrl = "https://7dtlerya6j.execute-api.us-east-1.amazonaws.com";
  const url = (import.meta.env.VITE_BEDROCK_API_URL as string | undefined) ?? defaultUrl;
  const basePath = (import.meta.env.VITE_BEDROCK_API_PATH as string | undefined) ?? "";
  // default to the analyze path since your gateway exposes /analyze in the example
  const defaultPath = "analyze";
  const endpoint = `${url.replace(/\/$/, "")}/${(basePath || defaultPath).replace(/^\//, "")}`.replace(/\/$/, "");

  const timeoutMs = options?.timeoutMs ?? 15000;
  const maxRetries = options?.maxRetries ?? 2;
  const max_tokens = options?.max_tokens ?? 500;

  // Build the request in the shape you provided
  // request_body = {
  //   "anthropic_version": "bedrock-2023-05-31",
  //   "max_tokens": 500,
  //   "messages": [ { role: "user", content: [{ type: "text", text: prompt }] } ]
  // }

  // Normalize history: accept either ConversationTurn or LegacyConversationTurn
  const normalizedHistory = (history || []).map((h: any) => {
    if (!h) return { role: "user", content: "" };
    if (typeof h === "object") {
      if ("role" in h && "content" in h) return { role: h.role === "agent" ? "agent" : "user", content: String(h.content) };
      if ("author" in h && "text" in h) return { role: h.author === "agent" ? "agent" : "user", content: String(h.text) };
    }
    // fallback: treat as user text
    return { role: "user", content: String(h) };
  });

  const messages = [
    ...normalizedHistory.map((h) => ({ role: h.role, content: [{ type: "text", text: h.content }] })),
    { role: "user", content: [{ type: "text", text: prompt }] },
  ];

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens,
    messages,
  };

  // If this endpoint is the /analyze sensor endpoint, some Lambdas expect a simple sensor payload
  const isAnalyzePath = endpoint.includes("/analyze");
  const buildSensorPayloadFromPrompt = (p: string, opts?: { temp?: number | null; level?: number | null }) => {
    // If frontend has explicit temp/level in options, prefer those
    const providedTemp = opts?.temp ?? null;
    const providedLevel = opts?.level ?? null;

    // sensorId: first token with letters/digits/hyphen
    const tokenMatch = p.match(/[A-Za-z0-9-]{2,}/);
    const sensorId = tokenMatch ? tokenMatch[0] : "UI-1";
    // temp: first floating number in prompt if not provided
    const numMatch = p.match(/-?\d+(?:\.\d+)?/);
    const temp = providedTemp !== null && providedTemp !== undefined ? providedTemp : (numMatch ? Number(numMatch[0]) : null);
    const level = providedLevel !== null && providedLevel !== undefined ? providedLevel : null;

    return { sensorId, temp, level } as Record<string, unknown>;
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // retry loop with exponential backoff
  let attempt = 0;
  while (true) {
    attempt += 1;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // For /analyze, the Lambda expects { temp, level, history: [{author,text}, ...] }
      let bodyToSend: string;
      if (isAnalyzePath) {
        // Convert normalizedHistory back into {author,text} items
        const historyForLambda = normalizedHistory.map((h) => ({ author: h.role === "agent" ? "assistant" : "user", text: h.content }));
        // allow caller to pass temp/level via options
        const sensorPayload = buildSensorPayloadFromPrompt(prompt, { temp: options?.temp ?? null, level: options?.level ?? null });
        const analyzeBody: Record<string, unknown> = {
          // keep short keys expected by existing Lambda
          temp: sensorPayload.temp,
          level: sensorPayload.level,
          history: historyForLambda,
        };
        bodyToSend = JSON.stringify(analyzeBody);
      } else {
        bodyToSend = JSON.stringify(payload);
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: bodyToSend,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const debug = (import.meta.env.VITE_DEBUG_BEDROCK as string | undefined) === "1";
        // include headers for debugging in the error message (stringify safe)
        const headersObj: Record<string, string> = {};
        res.headers.forEach((v, k) => (headersObj[k] = v));
        const errMsg = `Bedrock API request failed: ${res.status} ${res.statusText}` + (debug ? ` - body: ${text} - headers: ${JSON.stringify(headersObj)}` : ` - ${text}`);
        const err = new Error(errMsg);
        // Retry on 5xx
        if (res.status >= 500 && attempt <= maxRetries) {
          const backoff = 200 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        // Attach some useful metadata for callers to inspect (non-enumerable to avoid JSON noise)
        try {
          Object.defineProperty(err, "status", { value: res.status, enumerable: false });
          Object.defineProperty(err, "responseBody", { value: text, enumerable: false });
          Object.defineProperty(err, "responseHeaders", { value: headersObj, enumerable: false });
        } catch {}
        throw err;
      }

      const contentType = res.headers.get("content-type") || "";
      let json: unknown = null;
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        // fallback to text
        const text = await res.text();
        try {
          json = JSON.parse(text);
        } catch {
          // if not JSON, return text as reply
          return String(text);
        }
      }

      // Helper to safely extract a reply string from unknown JSON
      const extractReply = (data: unknown): string | null => {
        if (data == null) return null;
        if (typeof data === "string") return data;
        if (typeof data === "object") {
          const d = data as Record<string, unknown>;
          const candidates = [
            d.reply,
            d.message,
            d.result,
            d.response,
            d.output,
            d.analysis,
            d.completion,
            d.data,
          ];
          // direct 'analysis' top-level field
          if (typeof d.analysis === "string") return d.analysis;
          for (const c of candidates) {
            if (typeof c === "string") return c;
            if (c != null && typeof c !== "object") return String(c);
          }
          // messages array
          const msgs = d.messages as unknown;
          if (Array.isArray(msgs) && msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            if (typeof last === "string") return last;
            if (typeof last === "object" && last != null) {
              const lastObj = last as Record<string, unknown>;
              if (lastObj.content) return typeof lastObj.content === "string" ? lastObj.content : JSON.stringify(lastObj.content);
            }
          }
        }
        return null;
      };

      const reply = extractReply(json);
      if (reply) return reply;

      // As last resort, return the whole json as string
      try {
        return JSON.stringify(json);
      } catch (e) {
        return String(json);
      }
    } catch (err: unknown) {
      clearTimeout(id);
      // narrow unknown to extract name/message safely
      const e = err as { name?: string; message?: string };
      const isAbort = e.name === "AbortError";
      const isNetwork = e.name === "TypeError" || /network/i.test(e.message ?? "");
      if ((isAbort || isNetwork) && attempt <= maxRetries) {
        const backoff = 200 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw err;
    }
  }
}
