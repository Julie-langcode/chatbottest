import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ModeId } from "../types";
import { OPENERS } from "../data/curriculum";
import { buildSystemPrompt } from "../protocol/rules";
import { buildCheckerInput, buildCheckerSystem, parseCheckerOutput } from "../protocol/checker";

// The model and the limits are fixed on the server (api/chat.ts).
const API_URL = "/api/chat";
const MAX_RETRIES = 2;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

export interface UseClaudeChatOptions {
  mode: ModeId;
  /** Hallucination-management protocol on (levels 1–2) or off (baseline). */
  protocolEnabled: boolean;
}

export interface UseClaudeChatResult {
  messages: ChatMessage[];
  send: (text: string) => Promise<void>;
  isStreaming: boolean;
  /** True while a verification call (level 2) is still running for some reply. */
  isChecking: boolean;
  error: string | null;
  turns: number;
  /** Model that served the last reply, as reported by the server. */
  model: string | null;
  retry: () => void;
  reset: () => void;
}

interface ApiReply {
  text: string;
  model: string | null;
}

async function callApi(
  purpose: "chat" | "check",
  system: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ApiReply> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purpose, system, messages })
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = Array.isArray(data.content)
    ? data.content
        .map((b: { text?: string }) => (typeof b.text === "string" ? b.text : ""))
        .join("")
    : "";

  if (!text) {
    throw new Error("Empty response from API");
  }
  return { text, model: typeof data.served_model === "string" ? data.served_model : null };
}

export function useClaudeChat({ mode, protocolEnabled }: UseClaudeChatOptions): UseClaudeChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", content: OPENERS[mode], ts: now() }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingChecks, setPendingChecks] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  const turns = messages.filter((m) => m.role === "user").length;

  // Level 2: verify one coach reply. Runs in the background; never blocks the dialogue.
  const runCheck = useCallback(
    async (replyId: string, learnerText: string, replyText: string) => {
      setPendingChecks((n) => n + 1);
      let result;
      try {
        const { text } = await callApi("check", buildCheckerSystem(), [
          { role: "user", content: buildCheckerInput(mode, learnerText, replyText) }
        ]);
        result = parseCheckerOutput(text);
      } catch {
        result = { status: "error" as const, issues: [], checkedAt: now() };
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, check: result, checkPending: false } : m))
      );
      setPendingChecks((n) => n - 1);
    },
    [mode]
  );

  const runRequest = useCallback(
    async (history: ChatMessage[]) => {
      const { text, model: servedModel } = await callApi(
        "chat",
        buildSystemPrompt(mode, protocolEnabled),
        history.map((m) => ({ role: m.role, content: m.content }))
      );
      if (servedModel) setModel(servedModel);

      const replyId = uid();
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: "assistant", content: text, ts: now(), checkPending: protocolEnabled }
      ]);

      if (protocolEnabled) {
        const learnerText =
          [...history].reverse().find((m) => m.role === "user")?.content ?? "";
        void runCheck(replyId, learnerText, text);
      }
    },
    [mode, protocolEnabled, runCheck]
  );

  const sendInternal = useCallback(
    async (history: ChatMessage[]) => {
      setError(null);
      setIsStreaming(true);

      let attempt = 0;
      let lastError: unknown = null;

      while (attempt <= MAX_RETRIES) {
        try {
          await runRequest(history);
          setIsStreaming(false);
          return;
        } catch (err) {
          lastError = err;
          attempt += 1;
          if (attempt > MAX_RETRIES) break;
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
      }

      setIsStreaming(false);
      const msg =
        lastError instanceof Error ? lastError.message : "Something went wrong. Please retry.";
      setError(msg);
    },
    [runRequest]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      lastUserMessageRef.current = trimmed;

      const next: ChatMessage[] = [
        ...messages,
        { id: uid(), role: "user", content: trimmed, ts: now() }
      ];
      setMessages(next);
      await sendInternal(next);
    },
    [messages, isStreaming, sendInternal]
  );

  const retry = useCallback(() => {
    if (isStreaming) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") return;
    void sendInternal(messages);
  }, [messages, isStreaming, sendInternal]);

  const reset = useCallback(() => {
    setMessages([{ id: uid(), role: "assistant", content: OPENERS[mode], ts: now() }]);
    setError(null);
    setIsStreaming(false);
  }, [mode]);

  return {
    messages,
    send,
    isStreaming,
    isChecking: pendingChecks > 0,
    error,
    turns,
    model,
    retry,
    reset
  };
}
