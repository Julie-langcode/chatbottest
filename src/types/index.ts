import type { LucideIcon } from "lucide-react";

export type Role = "user" | "assistant";

/** Error types of the hallucination-management protocol (typology). */
export type ErrorType = "factual" | "linguistic" | "pragmatic" | "other";

export interface CheckIssue {
  type: ErrorType;
  /** Short quote from the coach's reply that the checker is unsure about. */
  quote: string;
  /** One-sentence explanation for the learner (in Russian). */
  note: string;
}

export interface CheckResult {
  status: "ok" | "warning" | "error";
  issues: CheckIssue[];
  checkedAt: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  /** ISO time the message was added. */
  ts?: string;
  /** Level 2 of the protocol: result of the verification call (assistant messages only). */
  check?: CheckResult;
  checkPending?: boolean;
}

export type ModeId =
  | "pitch_drill"
  | "vocab_match"
  | "objection_handling"
  | "negotiation_sim"
  | "follow_up_email";

export interface PracticeMode {
  id: ModeId;
  label: string;
  subtitle: string;
  desc: string;
  accent: string;
  icon: LucideIcon;
}

export interface VocabularyEntry {
  term: string;
  /** Short Russian definition shown in the hover tooltip. */
  def: string;
  /** Short English definition given to the model as the course glossary. */
  en: string;
}

/** Levels 3–4 of the protocol: a learner marks an AI reply as possibly wrong. */
export interface LearnerFlag {
  messageId: string;
  type: ErrorType;
  comment: string;
  ts: string;
}

/** Level 4 of the protocol: end-of-session reflection on the AI's accuracy. */
export interface Reflection {
  noticed: "yes" | "no" | "unsure";
  comment: string;
  ts: string;
}

export interface SessionData {
  sessionId: string;
  mode: ModeId;
  protocolEnabled: boolean;
  messages: ChatMessage[];
  flags: LearnerFlag[];
}

export type Screen = "welcome" | "chat" | "feedback";
