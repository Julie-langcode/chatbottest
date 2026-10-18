// Serverless function for POST /api/chat (Vercel) and the shared handler used by the Vite
// dev server (vite.config.ts imports handleChatRequest from here).
//
// Keep this file SELF-CONTAINED: no relative imports. The package is ESM ("type": "module"),
// and Vercel runs api/*.ts as separate Node ESM files, where an extensionless relative import
// such as "../server/anthropic" fails with ERR_MODULE_NOT_FOUND.
//
// Two model providers are supported; the browser does not know which one is used:
// - Yandex AI Studio (YandexGPT / Alice AI LLM): set YANDEX_API_KEY and YANDEX_FOLDER_ID.
// - Anthropic (Claude): set ANTHROPIC_API_KEY.
// If both are set, MODEL_PROVIDER ("yandex" | "anthropic") decides; otherwise Yandex wins.
// The reply is always returned in one shape: { content: [{ type: "text", text }], served_model }.

export type Purpose = "chat" | "check";
export type Provider = "yandex" | "anthropic";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
/** Alice AI LLM: Yandex's flagship text model, 128k context, supports the text generation API. */
export const DEFAULT_YANDEX_MODEL = "aliceai-llm";
const DEFAULT_YANDEX_URL = "https://ai.api.cloud.yandex.net/foundationModels/v1/completion";

const LIMITS: Record<Purpose, { maxTokens: number; temperature: number }> = {
  chat: { maxTokens: 1000, temperature: 0.7 },
  // The checker must be as deterministic as possible.
  check: { maxTokens: 700, temperature: 0 }
};

const MAX_SYSTEM_CHARS = 30_000;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 8_000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestBody {
  purpose?: Purpose;
  system?: unknown;
  messages?: unknown;
}

export interface HandlerResult {
  status: number;
  body: unknown;
}

/** Server settings, read from environment variables. */
export interface ServerEnv {
  MODEL_PROVIDER?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
  YANDEX_API_KEY?: string;
  YANDEX_FOLDER_ID?: string;
  YANDEX_MODEL?: string;
  YANDEX_API_URL?: string;
}

interface Validated {
  purpose: Purpose;
  system: string;
  messages: IncomingMessage[];
}

function validate(body: ChatRequestBody): { ok: true; value: Validated } | { ok: false; error: string } {
  const purpose: Purpose = body.purpose === "check" ? "check" : "chat";

  if (typeof body.system !== "string" || body.system.length === 0) {
    return { ok: false, error: "system must be a non-empty string" };
  }
  if (body.system.length > MAX_SYSTEM_CHARS) {
    return { ok: false, error: "system prompt is too long" };
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, error: "messages must be a non-empty array" };
  }
  if (body.messages.length > MAX_MESSAGES) {
    return { ok: false, error: "too many messages" };
  }

  const messages: IncomingMessage[] = [];
  for (const m of body.messages as unknown[]) {
    const msg = m as { role?: unknown; content?: unknown };
    if (msg.role !== "user" && msg.role !== "assistant") {
      return { ok: false, error: "message role must be user or assistant" };
    }
    if (typeof msg.content !== "string" || msg.content.length === 0) {
      return { ok: false, error: "message content must be a non-empty string" };
    }
    if (msg.content.length > MAX_MESSAGE_CHARS) {
      return { ok: false, error: "message is too long" };
    }
    messages.push({ role: msg.role, content: msg.content });
  }

  return { ok: true, value: { purpose, system: body.system, messages } };
}

export function pickProvider(env: ServerEnv): Provider | null {
  const wanted = (env.MODEL_PROVIDER || "").trim().toLowerCase();
  const hasYandex = Boolean(env.YANDEX_API_KEY && env.YANDEX_FOLDER_ID);
  const hasAnthropic = Boolean(env.ANTHROPIC_API_KEY);
  if (wanted === "yandex") return hasYandex ? "yandex" : null;
  if (wanted === "anthropic") return hasAnthropic ? "anthropic" : null;
  if (hasYandex) return "yandex";
  if (hasAnthropic) return "anthropic";
  return null;
}

function ok(text: string, servedModel: string): HandlerResult {
  return { status: 200, body: { content: [{ type: "text", text }], served_model: servedModel } };
}

async function readJson(response: Response): Promise<any> {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return { error: raw.slice(0, 500) };
  }
}

async function callAnthropic(v: Validated, env: ServerEnv): Promise<HandlerResult> {
  const model = env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
  const limits = LIMITS[v.purpose];
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: limits.maxTokens,
      temperature: limits.temperature,
      system: v.system,
      messages: v.messages
    })
  });
  const data = await readJson(response);
  if (!response.ok) return { status: response.status, body: data };
  const text = Array.isArray(data.content)
    ? data.content.map((b: { text?: string }) => (typeof b.text === "string" ? b.text : "")).join("")
    : "";
  return ok(text, `anthropic:${model}`);
}

async function callYandex(v: Validated, env: ServerEnv): Promise<HandlerResult> {
  const model = env.YANDEX_MODEL || DEFAULT_YANDEX_MODEL;
  const folder = env.YANDEX_FOLDER_ID as string;
  const limits = LIMITS[v.purpose];
  const response = await fetch(env.YANDEX_API_URL || DEFAULT_YANDEX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${env.YANDEX_API_KEY}`,
      "x-folder-id": folder
    },
    body: JSON.stringify({
      modelUri: `gpt://${folder}/${model}`,
      completionOptions: {
        stream: false,
        temperature: limits.temperature,
        maxTokens: String(limits.maxTokens)
      },
      messages: [
        { role: "system", text: v.system },
        ...v.messages.map((m) => ({ role: m.role, text: m.content }))
      ]
    })
  });
  const data = await readJson(response);
  if (!response.ok) return { status: response.status, body: data };

  // The REST response wraps the payload in "result"; accept both shapes.
  const payload = data && typeof data === "object" && data.result ? data.result : data;
  const alternative = Array.isArray(payload?.alternatives) ? payload.alternatives[0] : null;
  if (alternative?.status === "ALTERNATIVE_STATUS_CONTENT_FILTER") {
    return {
      status: 502,
      body: { error: "The model refused to answer (content filter). Rephrase the message and retry." }
    };
  }
  const text = typeof alternative?.message?.text === "string" ? alternative.message.text : "";
  return ok(text, `yandex:${model}`);
}

export async function handleChatRequest(body: ChatRequestBody, env: ServerEnv): Promise<HandlerResult> {
  const provider = pickProvider(env);
  if (!provider) {
    return {
      status: 500,
      body: {
        error:
          "No model configured on the server: set YANDEX_API_KEY and YANDEX_FOLDER_ID (or ANTHROPIC_API_KEY)"
      }
    };
  }

  const v = validate(body ?? {});
  if (!v.ok) {
    return { status: 400, body: { error: v.error } };
  }

  try {
    return provider === "yandex" ? await callYandex(v.value, env) : await callAnthropic(v.value, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return { status: 500, body: { error: message } };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const result = await handleChatRequest(req.body ?? {}, process.env as ServerEnv);
  return res.status(result.status).json(result.body);
}
