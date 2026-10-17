// Stage 0 of the protocol: a session log for testing.
//
// Every session is saved in this browser only (localStorage), with the condition it ran
// under (protocol on/off) and the versions of the prompts. The researcher or the teacher
// exports the log as JSON (full record) or CSV (one row per message, with empty columns
// for manual error annotation). Nothing is sent anywhere.

import { PROMPT_VERSION, PROTOCOL_VERSION } from "../protocol/config";
import type { ChatMessage, LearnerFlag, ModeId, Reflection } from "../types";

const STORAGE_KEY = "pb.sessions.v1";
const MAX_SESSIONS = 300;

export interface SessionRecord {
  id: string;
  startedAt: string;
  updatedAt: string;
  completed: boolean;
  mode: ModeId;
  protocolEnabled: boolean;
  protocolVersion: string;
  promptVersion: string;
  model: string | null;
  messages: ChatMessage[];
  flags: LearnerFlag[];
  reflection: Reflection | null;
}

function readAll(): SessionRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: SessionRecord[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-MAX_SESSIONS)));
  } catch {
    // Storage full or blocked: the session simply is not logged.
  }
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function startSession(id: string, mode: ModeId, protocolEnabled: boolean): void {
  const now = new Date().toISOString();
  const records = readAll().filter((r) => r.id !== id);
  records.push({
    id,
    startedAt: now,
    updatedAt: now,
    completed: false,
    mode,
    protocolEnabled,
    protocolVersion: PROTOCOL_VERSION,
    promptVersion: PROMPT_VERSION,
    model: null,
    messages: [],
    flags: [],
    reflection: null
  });
  writeAll(records);
}

export function updateSession(id: string, patch: Partial<Omit<SessionRecord, "id">>): void {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return;
  records[idx] = { ...records[idx], ...patch, updatedAt: new Date().toISOString() };
  writeAll(records);
}

export function listSessions(): SessionRecord[] {
  return readAll();
}

export function clearSessions(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function download(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp(): string {
  return new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
}

export function exportJson(): void {
  download(
    `pitchbot-sessions-${stamp()}.json`,
    JSON.stringify(readAll(), null, 2),
    "application/json"
  );
}

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const CSV_HEADER = [
  "session_id",
  "started_at",
  "mode",
  "protocol",
  "protocol_version",
  "prompt_version",
  "model",
  "turn",
  "role",
  "content",
  "checker_status",
  "checker_issues",
  "learner_flag_type",
  "learner_flag_comment",
  "reflection_noticed",
  "reflection_comment",
  // Empty columns for the researcher's manual annotation (pilot):
  "annot_error_yes_no",
  "annot_error_type",
  "annot_quote",
  "annot_note",
  "annot_rater"
];

/** One row per message; the annot_* columns are left empty for manual error annotation. */
export function exportCsv(): void {
  const rows: string[] = [CSV_HEADER.join(",")];
  for (const s of readAll()) {
    let turn = 0;
    for (const m of s.messages) {
      if (m.role === "user") turn += 1;
      const flag = s.flags.find((f) => f.messageId === m.id);
      const issues = m.check?.issues
        .map((i) => `[${i.type}] "${i.quote}" — ${i.note}`)
        .join(" | ");
      rows.push(
        [
          s.id,
          s.startedAt,
          s.mode,
          s.protocolEnabled ? "on" : "off",
          s.protocolVersion,
          s.promptVersion,
          s.model ?? "",
          turn,
          m.role,
          m.content,
          m.check?.status ?? "",
          issues ?? "",
          flag?.type ?? "",
          flag?.comment ?? "",
          s.reflection?.noticed ?? "",
          s.reflection?.comment ?? "",
          "",
          "",
          "",
          "",
          ""
        ]
          .map(csvCell)
          .join(",")
      );
    }
  }
  // BOM so Excel opens Cyrillic text correctly.
  download(`pitchbot-annotation-${stamp()}.csv`, "﻿" + rows.join("\r\n"), "text/csv");
}
