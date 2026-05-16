import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ModeId } from "../types";
import { OPENERS, SYSTEM_PROMPTS } from "../data/curriculum";

const API_URL = "https://api.anthropic.com/v1/messages";
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
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
      if (!apiKey) {
        throw new Error(
          "Missing VITE_ANTHROPIC_API_KEY. Add it to .env and restart the dev server."
        );
      }

      const payload = {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        system: SYSTEM_PROMPTS[mode],
        messages: history.map((m) => ({ role: m.role, content: m.content }))
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${txt.slice(0, 200)}`);
      }

      const assistantId = uid();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const evt = JSON.parse(data);
            if (
              evt.type === "content_block_delta" &&
              evt.delta &&
              typeof evt.delta.text === "string"
            ) {
              const chunk = evt.delta.text as string;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + chunk } : m
                )
              );
            } else if (evt.type === "error") {
              throw new Error(evt.error?.message ?? "Stream error");
            }
          } catch (err) {
            // Ignore JSON parse errors on incomplete chunks
            if (err instanceof SyntaxError) continue;
            throw err;
          }
        }
      }
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
      // Drop the empty assistant bubble if it was added
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
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
    // Re-run last request using current history (last message is the user's)
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
