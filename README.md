# Pitch & Negotiations Practice Bot

A focused web chatbot for practicing business English in pitch and negotiation scenarios. Built for **Leaders' Speaking Club — Module 1**.

Target audience: founders, executives, and senior managers (30+) with B1–B2 English who want to rehearse high-stakes business conversations in a safe space, with instant feedback.

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind base + CSS variables for the theme (warm dark palette, gold accent), Fraunces display + Inter + JetBrains Mono
- **Icons:** lucide-react
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514` by default, `ANTHROPIC_MODEL` to override) via `/v1/messages`
- **State:** React hooks (no Redux)
- **Backend:** a thin server route `/api/chat` (`api/chat.ts` on Vercel, the same handler in the Vite dev server). It holds the API key and fixes the model and token limits; the browser never sees the key.

## Features

- 5 practice modes:
  - 🎤 **Pitch Drill** — pitch to a tough Silicon Valley investor
  - 🃏 **Vocab Match** — gamified vocabulary quiz
  - ⚡ **Objection Handling** — defend against realistic investor objections
  - 🤝 **Negotiation Sim** — bargain deal terms with BATNA in mind
  - ✉️ **Follow-up Email** — draft and get feedback on a post-meeting email
- Streamed responses for a live feel
- Vocabulary auto-highlighting with hover/tap tooltips (RU definitions)
- 5-exchange session structure with progress dots
- Structured feedback card at the end (with copy-to-clipboard)
- Quick-reply suggestions on session start
- Multi-line input with auto-resize and Enter-to-send
- Mobile-first, responsive 375px → 1440px
- Error handling with up to 2 retries + manual retry button

## Setup

```bash
npm install

cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY (server-side; no VITE_ prefix)

npm run dev
```

The dev server runs at `http://localhost:5173` and serves `/api/chat` itself, so the bot works
locally with the key from `.env`. On Vercel, set `ANTHROPIC_API_KEY` in the project's
environment variables.

## Build

```bash
npm run build
npm run preview
```

## Security notes

- The API key stays on the server (`api/chat.ts`, `server/anthropic.ts`); it is never in the bundle.
- The server fixes the model, `max_tokens` and temperature and validates the request, so the
  route cannot be used to call other models or to run long generations.
- The route has no authentication or rate limit yet. Before sharing the URL widely, add one
  (e.g. Vercel firewall rules or a simple access code).

## Accuracy protocol (hallucination management)

The bot implements a four-level protocol for managing errors of generative AI
(research for the master's thesis, HSE University — St Petersburg). The protocol is **on by
default** and can be switched off for comparison (research panel on the start screen, or
`?protocol=off` in the URL).

| Level | What it does | Where |
|---|---|---|
| 1. System rules | Accuracy rules + the course glossary added to every mode's prompt: no false corrections, flag uncertainty, glossary meanings, no invented real-world facts, no legal/financial interpretations, polite model phrases. Real companies replaced with fictional ones. | `src/protocol/rules.ts`, `src/data/curriculum.ts` |
| 2. Verification | After each coach reply, a separate deterministic call checks the coach's teaching against the glossary and the error typology (factual / linguistic / pragmatic). The result is shown under the reply. | `src/protocol/checker.ts`, `src/components/MessageAudit.tsx` |
| 3. Teacher | Learners flag replies ("Ошибка ИИ?"); the session log with flags and checker results is exported for the teacher. | `src/components/MessageAudit.tsx`, `src/components/ResearchPanel.tsx` |
| 4. Learner | End-of-session "Проверь ИИ" block: what was flagged, a reflection question, a short guide to spotting AI errors. | `src/components/AiCheckReflection.tsx` |

**Session log (stage 0).** Every session is saved in the browser (localStorage) with its condition
(protocol on/off), protocol and prompt versions, the model, all messages, checker results, flags
and the reflection. The research panel exports it as JSON or as a CSV with empty annotation
columns. Nothing is sent to any server.

**Pilot.** Scenarios, the annotation guide and the analysis script are in
[`research/pilot/`](research/pilot/README.md).

## Project layout

```
api/chat.ts                  # Vercel function → server/anthropic.ts
server/anthropic.ts          # Shared handler: key, model, limits, validation
research/pilot/              # Pilot scenarios, annotation guide, analyze.py
src/
├── components/
│   ├── WelcomeScreen.tsx    # Hero + mode grid + research panel
│   ├── ChatScreen.tsx       # Chat shell, progress dots, session logging
│   ├── MessageAudit.tsx     # Checker result + "AI mistake?" flag under each reply
│   ├── FeedbackScreen.tsx   # End-of-session feedback + vocab chips
│   ├── AiCheckReflection.tsx# Level 4: "Проверь ИИ" reflection block
│   ├── ResearchPanel.tsx    # Protocol on/off, log export
│   └── messageRenderer.tsx  # Markdown-lite + vocab highlighting
├── hooks/
│   └── useClaudeChat.ts     # API calls, retries, background verification
├── protocol/
│   ├── config.ts            # Versions, protocol on/off setting
│   ├── rules.ts             # Level 1: accuracy rules + glossary block
│   └── checker.ts           # Level 2: verification prompt and parser
├── research/
│   └── sessionLog.ts        # Session log, JSON/CSV export
├── data/
│   └── curriculum.ts        # Glossary, modes, prompts, openers
├── types/index.ts
├── index.css                # Theme tokens, animations, grain
├── App.tsx                  # 3-screen router
└── main.tsx
```

---

Leaders' Speaking Club · Module 1: Pitch & Negotiations
