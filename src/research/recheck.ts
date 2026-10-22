// Pilot, stage 2: apply level 2 of the protocol (the verification call) to replies that were
// already recorded WITHOUT the protocol (condition A).
//
// Why: comparing new sessions with and without the protocol mixes the protocol's effect with
// the model's randomness (every run produces different replies). Re-checking the very same
// replies that the researcher has already annotated isolates one question: how many of the
// known errors does the verification call catch, and how many false alarms does it raise?
//
// Results are stored in this browser only, under their own key, and never change the sessions.

import { buildCheckerInput, buildCheckerSystem, parseCheckerOutput } from "../protocol/checker";
import { PROMPT_VERSION, PROTOCOL_VERSION } from "../protocol/config";
import type { CheckResult } from "../types";
import { listSessions, type SessionRecord } from "./sessionLog";

const STORAGE_KEY = "pb.recheck.v1";
const PAUSE_MS = 400;

export interface RecheckEntry {
  sessionId: string;
  messageId: string;
  mode: string;
  turn: number;
  result: CheckResult;
  protocolVersion: string;
  promptVersion: string;
}

interface Target {
  session: SessionRecord;
  messageId: string;
  turn: number;
  learner: string;
  reply: string;
}

function readAll(): Record<string, RecheckEntry> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(entries: Record<string, RecheckEntry>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked: results stay in memory for the export below.
  }
}

const key = (sessionId: string, messageId: string) => `${sessionId}:${messageId}`;

/** Every generated reply (not the fixed opener) of completed sessions recorded without the protocol. */
function targets(): Target[] {
  const out: Target[] = [];
  for (const s of listSessions()) {
    if (s.protocolEnabled || !s.completed) continue;
    let turn = 0;
    let learner = "";
    for (const m of s.messages) {
      if (m.role === "user") {
        turn += 1;
        learner = m.content;
      } else if (turn > 0) {
        out.push({ session: s, messageId: m.id, turn, learner, reply: m.content });
      }
    }
  }
  return out;
}

export function recheckStatus(): { total: number; done: number } {
  const entries = readAll();
  const all = targets();
  const done = all.filter((t) => {
    const e = entries[key(t.session.id, t.messageId)];
    return e && e.result.status !== "error";
  }).length;
  return { total: all.length, done };
}

async function checkOne(t: Target): Promise<CheckResult> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose: "check",
      system: buildCheckerSystem(),
      messages: [{ role: "user", content: buildCheckerInput(t.session.mode, t.learner, t.reply) }]
    })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const text = Array.isArray(data.content)
    ? data.content.map((b: { text?: string }) => (typeof b.text === "string" ? b.text : "")).join("")
    : "";
  return parseCheckerOutput(text);
}

/**
 * Re-checks every pending reply, one at a time. Already checked replies are skipped, so the
 * run can be interrupted and resumed; replies whose check failed are retried.
 */
export async function runRecheck(onProgress: (done: number, total: number) => void): Promise<void> {
  const entries = readAll();
  const all = targets();
  const isDone = (t: Target) => {
    const e = entries[key(t.session.id, t.messageId)];
    return Boolean(e && e.result.status !== "error");
  };
  let done = all.filter(isDone).length;
  onProgress(done, all.length);

  for (const t of all) {
    const k = key(t.session.id, t.messageId);
    if (entries[k] && entries[k].result.status !== "error") continue;
    let result: CheckResult;
    try {
      result = await checkOne(t);
    } catch {
      result = { status: "error", issues: [], checkedAt: new Date().toISOString() };
    }
    entries[k] = {
      sessionId: t.session.id,
      messageId: t.messageId,
      mode: t.session.mode,
      turn: t.turn,
      result,
      protocolVersion: PROTOCOL_VERSION,
      promptVersion: PROMPT_VERSION
    };
    writeAll(entries);
    if (result.status !== "error") done += 1;
    onProgress(done, all.length);
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }
}

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** One row per re-checked reply; joins with the annotated CSV on session_id + turn. */
export function exportRecheckCsv(): void {
  const entries = readAll();
  const header = [
    "session_id",
    "mode",
    "turn",
    "reply_start",
    "recheck_status",
    "recheck_issues",
    "checked_at",
    "protocol_version",
    "prompt_version"
  ];
  const rows = [header.join(",")];
  for (const t of targets()) {
    const e = entries[key(t.session.id, t.messageId)];
    if (!e) continue;
    rows.push(
      [
        t.session.id,
        t.session.mode,
        t.turn,
        t.reply.trim().slice(0, 80),
        e.result.status,
        e.result.issues.map((i) => `[${i.type}] "${i.quote}" — ${i.note}`).join(" | "),
        e.result.checkedAt,
        e.protocolVersion,
        e.promptVersion
      ]
        .map(csvCell)
        .join(",")
    );
  }
  const blob = new Blob(["﻿" + rows.join("\r\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pitchbot-recheck-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
