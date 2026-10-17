import { useState } from "react";
import { AlertTriangle, CheckCircle2, Flag, Loader2 } from "lucide-react";
import { ERROR_TYPE_LABELS } from "../protocol/config";
import type { ChatMessage, ErrorType, LearnerFlag } from "../types";

interface Props {
  message: ChatMessage;
  protocolEnabled: boolean;
  flag: LearnerFlag | undefined;
  onFlag: (type: ErrorType, comment: string) => void;
}

const FLAG_TYPES: ErrorType[] = ["factual", "linguistic", "pragmatic", "other"];

const small: React.CSSProperties = { fontSize: 12, lineHeight: 1.5 };

/**
 * Shown under each coach reply:
 * - level 2: the result of the verification call (protocol on only);
 * - levels 3–4: the learner's "AI mistake?" flag, which goes to the teacher via the log export.
 */
export function MessageAudit({ message, protocolEnabled, flag, onFlag }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ErrorType>("linguistic");
  const [comment, setComment] = useState("");

  const check = message.check;

  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {protocolEnabled && message.checkPending && (
        <div style={{ ...small, color: "var(--text-dim)", display: "flex", gap: 6, alignItems: "center" }}>
          <Loader2 size={12} className="pb-spin" /> Проверка по словарю курса…
        </div>
      )}

      {protocolEnabled && check?.status === "ok" && (
        <div style={{ ...small, color: "var(--success)", display: "flex", gap: 6, alignItems: "center" }}>
          <CheckCircle2 size={12} /> Проверено по словарю курса: замечаний нет
        </div>
      )}

      {protocolEnabled && check?.status === "error" && (
        <div style={{ ...small, color: "var(--text-dim)" }}>
          Автоматическая проверка не выполнена — оцени ответ сама.
        </div>
      )}

      {protocolEnabled && check?.status === "warning" && (
        <div
          style={{
            ...small,
            color: "var(--text)",
            background: "rgba(233, 184, 114, 0.08)",
            border: "1px solid rgba(233, 184, 114, 0.35)",
            borderRadius: 8,
            padding: "8px 10px"
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--warn)", marginBottom: 4 }}>
            <AlertTriangle size={12} /> Возможная неточность — проверь по словарю или у преподавателя
          </div>
          {check.issues.map((issue, i) => (
            <div key={i} style={{ marginTop: 4 }}>
              <span style={{ color: "var(--warn)" }}>
                {ERROR_TYPE_LABELS[issue.type]}
                {issue.quote ? ` · «${issue.quote}»` : ""}
              </span>
              <div style={{ color: "var(--text-muted)" }}>{issue.note}</div>
            </div>
          ))}
        </div>
      )}

      {flag ? (
        <div style={{ ...small, color: "var(--danger)", display: "flex", gap: 6, alignItems: "center" }}>
          <Flag size={12} /> Отмечено как ошибка ИИ: {ERROR_TYPE_LABELS[flag.type].toLowerCase()}
          {flag.comment ? ` — ${flag.comment}` : ""}
        </div>
      ) : open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FLAG_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="pb-btn-ghost"
                style={{
                  ...small,
                  padding: "4px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  borderColor: type === t ? "var(--accent)" : undefined,
                  color: type === t ? "var(--accent)" : undefined
                }}
              >
                {ERROR_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Что не так? (необязательно)"
            className="pb-textarea"
            style={{ ...small, padding: "6px 10px", borderRadius: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="pb-btn-primary"
              style={{ ...small, padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
              onClick={() => {
                onFlag(type, comment.trim());
                setOpen(false);
              }}
            >
              Сохранить
            </button>
            <button
              type="button"
              className="pb-btn-ghost"
              style={{ ...small, padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
              onClick={() => setOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            ...small,
            alignSelf: "flex-start",
            background: "transparent",
            border: "none",
            padding: 0,
            color: "var(--text-dim)",
            cursor: "pointer",
            display: "flex",
            gap: 6,
            alignItems: "center"
          }}
          aria-label="Отметить ошибку ИИ"
        >
          <Flag size={12} /> Ошибка ИИ?
        </button>
      )}
    </div>
  );
}
