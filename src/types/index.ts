import type { LucideIcon } from "lucide-react";

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
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
  def: string;
}

export interface SessionData {
  mode: ModeId;
  messages: ChatMessage[];
}

export type Screen = "welcome" | "chat" | "feedback";
