# Pitch & Negotiations Practice Bot

A focused web chatbot for practicing business English in pitch and negotiation scenarios. Built for **Leaders' Speaking Club — Module 1**.

Target audience: founders, executives, and senior managers (30+) with A2–B2 English who want to rehearse high-stakes business conversations in a safe space, with instant feedback.

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind base + CSS variables for the theme (warm dark palette, gold accent), Fraunces display + Inter + JetBrains Mono
- **Icons:** lucide-react
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`) via `/v1/messages` with streaming
- **State:** React hooks (no Redux)
- **Backend:** none — the browser calls Anthropic directly using `anthropic-dangerous-direct-browser-access`

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
# Edit .env and set VITE_ANTHROPIC_API_KEY

npm run dev
```

The dev server runs at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Security notes

This app puts your Anthropic API key in the browser bundle. That's acceptable for:

- A controlled demo or workshop where you rotate the key afterwards
- Personal practice on your own machine

For production, route the request through a thin server proxy and keep the key out of the client.

## Project layout

```
src/
├── components/
│   ├── WelcomeScreen.tsx    # Hero + mode grid
│   ├── ChatScreen.tsx       # Chat shell with streaming + progress dots
│   ├── FeedbackScreen.tsx   # End-of-session feedback + vocab chips
│   └── messageRenderer.tsx  # Markdown-lite + vocab highlighting
├── hooks/
│   └── useClaudeChat.ts     # Streaming + retry logic
├── data/
│   └── curriculum.ts        # Vocab, modes, prompts, openers
├── types/index.ts
├── index.css                # Theme tokens, animations, grain
├── App.tsx                  # 3-screen router
└── main.tsx
```

---

Leaders' Speaking Club · Module 1: Pitch & Negotiations
