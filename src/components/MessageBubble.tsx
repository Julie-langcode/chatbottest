import { useMemo } from "react";
import { VOCABULARY } from "../data/curriculum";
import type { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
}

// Escape regex special characters
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a single regex matching all vocab terms (longest first for greedy)
const VOCAB_REGEX = new RegExp(
  `\\b(${VOCABULARY.map((v) => escapeRegex(v.term))
    .sort((a, b) => b.length - a.length)
    .join("|")})\\b`,
  "gi"
);

const VOCAB_MAP = new Map(VOCABULARY.map((v) => [v.term.toLowerCase(), v.definition]));

interface Segment {
  type: "text" | "vocab";
  value: string;
  definition?: string;
}

function splitVocab(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  VOCAB_REGEX.lastIndex = 0;
  while ((match = VOCAB_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const def = VOCAB_MAP.get(match[0].toLowerCase());
    segments.push({ type: "vocab", value: match[0], definition: def });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }
  return segments;
}

// Render a line with **bold** support, then vocab highlighting
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {renderVocab(inner, `${keyPrefix}-b-${i}`)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{renderVocab(part, `${keyPrefix}-t-${i}`)}</span>;
  });
}

function renderVocab(text: string, keyPrefix: string) {
  const segments = splitVocab(text);
  return segments.map((seg, i) => {
    if (seg.type === "vocab") {
      return (
        <span key={`${keyPrefix}-v-${i}`} className="vocab-term" tabIndex={0}>
          {seg.value}
          <span className="vocab-tooltip" role="tooltip">
            {seg.definition}
          </span>
        </span>
      );
    }
    return <span key={`${keyPrefix}-x-${i}`}>{seg.value}</span>;
  });
}

function renderBlock(text: string) {
  const lines = text.split("\n");
  const out: JSX.Element[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-1">
        {listBuffer.map((item, i) => (
          <li key={`li-${key}-${i}`}>{renderInline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      return;
    }
    flushList(String(idx));
    if (line.trim() === "") {
      out.push(<div key={`sp-${idx}`} className="h-2" />);
    } else {
      out.push(
        <p key={`p-${idx}`} className="leading-relaxed">
          {renderInline(line, `p-${idx}`)}
        </p>
      );
    }
  });
  flushList("end");
  return out;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const content = useMemo(() => renderBlock(message.content || ""), [message.content]);

  return (
    <div
      className={`flex w-full animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mr-2 mt-1 hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-semibold">
          AI
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md ${
          isUser
            ? "bg-accent text-white rounded-br-sm"
            : "bg-bg-elevated text-slate-100 rounded-bl-sm border border-white/5"
        }`}
      >
        {content.length > 0 ? (
          content
        ) : (
          <span className="opacity-60 italic">…</span>
        )}
      </div>
    </div>
  );
}
