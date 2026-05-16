import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ModeId } from "../types";
import { OPENERS, SYSTEM_PROMPTS } from "../data/curriculum";

const API_URL = "/api/chat";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;
const MAX_RETRIES = 2;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface UseClaudeChatOptions {
  mode: ModeId;
}

export interface UseClaudeChatResult {
  messages: ChatMessage[];
  send: (text: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  turns: number;
  retry: () => void;
  reset: () => void;
}

export function useClaudeChat({ mode }: UseClaudeChatOptions): UseClaudeChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", content: OPENERS[mode] }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  const turns = messages.filter((m) => m.role === "user").length;

  const runRequest = useCallback(
    async (history: ChatMessage[]) => {
      const payload = {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPTS[mode],
        messages: history.map((m) => ({ role: m.role, content: m.content }))
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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

      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: text }]);
    },
    [mode]
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
        { id: uid(), role: "user", content: trimmed }
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
    setMessages([{ id: uid(), role: "assistant", content: OPENERS[mode] }]);
    setError(null);
    setIsStreaming(false);
  }, [mode]);

  return { messages, send, isStreaming, error, turns, retry, reset };
}
