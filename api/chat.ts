// Serverless function for POST /api/chat (Vercel) and the shared handler used by the Vite
// dev server (vite.config.ts imports handleChatRequest from here).
//
// Keep this file SELF-CONTAINED: no relative imports. The package is ESM ("type": "module"),
// and Vercel runs api/*.ts as separate Node ESM files, where an extensionless relative import
// such as "../server/anthropic" fails with ERR_MODULE_NOT_FOUND.

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export type Purpose = "chat" | "check";

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

function validate(body: ChatRequestBody):
  | { ok: true; purpose: Purpose; system: string; messages: IncomingMessage[] }
  | { ok: false; error: string } {
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

  return { ok: true, purpose, system: body.system, messages };
}

export async function handleChatRequest(
  body: ChatRequestBody,
  apiKey: string | undefined,
  model: string = DEFAULT_MODEL
): Promise<HandlerResult> {
  if (!apiKey) {
    return { status: 500, body: { error: "Missing ANTHROPIC_API_KEY on server" } };
  }

  const v = validate(body ?? {});
  if (!v.ok) {
    return { status: 400, body: { error: v.error } };
  }

  const limits = LIMITS[v.purpose];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
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

    const data = await response.json();
    // Report which model actually answered, so session logs record it.
    if (response.ok && data && typeof data === "object") {
      return { status: 200, body: { ...data, served_model: model } };
    }
    return { status: response.status, body: data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return { status: 500, body: { error: message } };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const result = await handleChatRequest(
    req.body ?? {},
    process.env.ANTHROPIC_API_KEY,
    process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
  );
  return res.status(result.status).json(result.body);
}
