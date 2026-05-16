import { Fragment, type ReactNode } from "react";
import { VOCABULARY } from "../data/curriculum";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const sortedVocab = [...VOCABULARY].sort((a, b) => b.term.length - a.term.length);
const VOCAB_PATTERN = sortedVocab.map((v) => escapeRegex(v.term)).join("|");
const VOCAB_REGEX = new RegExp(`\\b(${VOCAB_PATTERN})\\b`, "gi");

export function highlightVocab(text: string, keyPrefix = "v"): ReactNode[] {
  if (!text) return [];
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  VOCAB_REGEX.lastIndex = 0;
  while ((match = VOCAB_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={`${keyPrefix}-t-${key++}`}>{text.slice(lastIndex, match.index)}</Fragment>
      );
    }
    const matched = match[0].toLowerCase();
    const vocab = VOCABULARY.find((v) => v.term.toLowerCase() === matched);
    parts.push(
      <span
        key={`${keyPrefix}-v-${key++}`}
        className="pb-vocab"
        data-def={vocab?.def ?? ""}
        tabIndex={0}
      >
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={`${keyPrefix}-t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return parts;
}

export function renderMessage(text: string): ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    let remaining = line;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      const candidates = [boldMatch, italicMatch].filter(Boolean) as RegExpMatchArray[];
      const earliest = candidates.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))[0];

      if (!earliest) {
        parts.push(
          <Fragment key={`l${lineIdx}-${key++}`}>
            {highlightVocab(remaining, `l${lineIdx}-h${key}`)}
          </Fragment>
        );
        break;
      }
      const idx = earliest.index ?? 0;
      if (idx > 0) {
        parts.push(
          <Fragment key={`l${lineIdx}-${key++}`}>
            {highlightVocab(remaining.slice(0, idx), `l${lineIdx}-h${key}`)}
          </Fragment>
        );
      }
      if (earliest === boldMatch) {
        parts.push(
          <strong
            key={`l${lineIdx}-${key++}`}
            style={{ color: "var(--text)", fontWeight: 600 }}
          >
            {highlightVocab(earliest[1], `l${lineIdx}-h${key}`)}
          </strong>
        );
      } else {
        parts.push(
          <em
            key={`l${lineIdx}-${key++}`}
            style={{ color: "var(--text-muted)" }}
          >
            {highlightVocab(earliest[1], `l${lineIdx}-h${key}`)}
          </em>
        );
      }
      remaining = remaining.slice(idx + earliest[0].length);
    }
    return (
      <div key={lineIdx} style={{ minHeight: line === "" ? "0.6em" : "auto" }}>
        {parts}
      </div>
    );
  });
}
