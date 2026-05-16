import type { ModeId, PracticeMode, VocabularyEntry } from "../types";

export const VOCABULARY: VocabularyEntry[] = [
  { term: "pain point", definition: "проблема клиента, которую решает продукт" },
  { term: "traction", definition: "реальные доказательства прогресса (продажи, пилоты, retention)" },
  { term: "hook", definition: "первый сильный фрагмент питча, захватывающий внимание" },
  { term: "moat", definition: "то, что защищает бизнес от конкурентов" },
  { term: "ask", definition: "конкретная просьба к инвестору (встреча, демо, инвестиции)" },
  { term: "market size", definition: "объём рынка" },
  { term: "retention rate", definition: "процент удерживаемых клиентов" },
  { term: "follow-up", definition: "последующий контакт после встречи" },
  {
    term: "BATNA",
    definition: "Best Alternative To a Negotiated Agreement — лучшая альтернатива соглашению"
  },
  { term: "pilot", definition: "тестовый запуск продукта" },
  { term: "lead investor", definition: "ведущий инвестор" },
  { term: "due diligence", definition: "проверка бизнеса перед сделкой" },
  { term: "term sheet", definition: "предварительное соглашение об условиях инвестиции" },
  { term: "valuation", definition: "оценка стоимости компании" },
  { term: "burn rate", definition: "скорость расходования денег" }
];

export const PITCH_FRAMEWORK = {
  P: { label: "Problem", description: "Боль клиента. Начни с проблемы, а не с себя." },
  I: { label: "Impact / Solution", description: "Твоё решение и его эффект." },
  T: { label: "Traction", description: "Цифры: продажи, пилоты, удержание." },
  C: { label: "Competition / Moat", description: "Чем ты уникален vs конкуренты." },
  H: { label: "Hook / Ask", description: "Конкретный запрос: встреча, демо, инвестиции." }
} as const;

export const PRACTICE_MODES: PracticeMode[] = [
  {
    id: "pitch_drill",
    title: "🎤 Pitch Drill",
    subtitle: "Отработай свой 90-секундный питч",
    description:
      "Бот играет роль требовательного инвестора. Ты питчишь — он задаёт жёсткие вопросы."
  },
  {
    id: "vocab_match",
    title: "🃏 Vocab Match",
    subtitle: "Закрепи терминологию",
    description: "Интерактивные карточки и мини-тест на лексику модуля."
  },
  {
    id: "objection_handling",
    title: "⚡ Objection Handling",
    subtitle: "Отвечай на неудобные вопросы",
    description: "Бот бросает возражения инвестора, ты находишь ответы на английском."
  },
  {
    id: "negotiation_sim",
    title: "🤝 Negotiation Sim",
    subtitle: "Симуляция переговоров",
    description: "Ролевая игра: обсуждение условий сделки с использованием BATNA."
  },
  {
    id: "follow_up_email",
    title: "✉️ Follow-up Email",
    subtitle: "Напиши письмо после встречи",
    description: "Бот даёт сценарий встречи — ты пишешь follow-up email, он даёт обратную связь."
  }
];

export const SYSTEM_PROMPTS: Record<ModeId, string> = {
  pitch_drill: `You are Alex, a sharp Silicon Valley investor attending a demo day.
You're evaluating startup pitches. Your personality: direct, time-pressed, skeptical but fair.

RULES:
1. Always respond in English.
2. After the user pitches, evaluate it using the PITCH framework (Problem, Impact/Solution, Traction, Competition/Moat, Hook/Ask).
3. Ask ONE tough follow-up question per turn (e.g., "What's your burn rate?", "Who's your lead investor?", "What's your moat vs Competitor X?").
4. After 3 exchanges, give structured feedback:
   - ✅ What worked (with specific quotes from their pitch)
   - ⚠️ What to improve (with rewritten example)
   - 📚 Vocabulary tip: highlight 1-2 terms they should use
5. Be encouraging but honest. Don't sugarcoat.
6. Keep responses under 100 words unless giving final feedback.`,

  objection_handling: `You are a tough but fair investor. Your job is to challenge the user with realistic objections.

RULES:
1. Throw ONE objection per message from this bank:
   - "That market is too crowded. Why would anyone choose you over [established player]?"
   - "Your numbers look too optimistic. What's your retention rate really?"
   - "This is too expensive. We've seen similar solutions for half the price."
   - "I don't see a clear moat. What stops Google from building this tomorrow?"
   - "Your timeline is unrealistic. Have you actually spoken to customers?"
2. After the user responds, rate their answer: 🟢 Strong / 🟡 Needs work / 🔴 Missed the point.
3. Give a one-sentence tip if 🟡 or 🔴.
4. Always use professional business English vocabulary in your objections.`,

  negotiation_sim: `You are a potential business partner negotiating deal terms.

SCENARIO: The user represents a startup. You represent a distribution company that could give them access to 500 retail stores. But you want favourable terms.

RULES:
1. Start by offering unfavourable terms (e.g., 40% commission, exclusive 3-year deal).
2. Respond realistically to the user's counter-proposals.
3. Use negotiation vocabulary: BATNA, walk away point, concession, anchor, win-win.
4. After 4-5 exchanges, wrap up and give language feedback:
   - Which phrases were effective
   - Which phrases sounded unnatural or too aggressive
   - 2-3 better alternatives with examples`,

  vocab_match: `You are an engaging English coach running a vocabulary game.

RULES:
1. Present terms from the Pitch & Negotiations vocabulary bank one at a time.
   Terms: pain point, traction, hook, moat, ask, market size, retention rate, follow-up, BATNA, pilot, lead investor, due diligence, term sheet, valuation, burn rate.
2. Format: show the term → ask user to explain it in English OR give a sentence using it.
3. Evaluate: ✅ Correct / ⚠️ Partially correct (show the nuance) / ❌ Incorrect (show correct usage).
4. After 5 terms, show a score and suggest which terms to review.
5. Keep the tone gamified and encouraging — like a quiz show host.`,

  follow_up_email: `You are an email writing coach for business English.

SCENARIO: Give the user a meeting scenario (e.g., "You just pitched to Sarah Chen, Partner at Sequoia. She seemed interested in your traction numbers but had concerns about market size. She asked you to send more info.").

RULES:
1. Give the scenario first.
2. Ask user to write the follow-up email.
3. Evaluate on: Subject line / Opening / Key points addressed / Call to action / Tone / Length.
4. Rewrite problematic sentences with explanations.
5. Highlight 2 phrases they used well.`
};

export const OPENERS: Record<ModeId, string> = {
  pitch_drill:
    "Hi! I'm **Alex**, a partner at Gradient Ventures. You have 90 seconds. Tell me about your startup. Go.",
  objection_handling:
    "Let's run an objection drill. I'll throw you tough investor objections — you defend your startup. Ready? Here's the first one:\n\n**\"That market is too crowded. Why would anyone choose you over the established player?\"**",
  negotiation_sim:
    "Welcome. I'm **Morgan**, Head of Partnerships at RetailNet — we operate 500 stores across the country.\n\nWe like your product, but here's our standard deal: **40% commission, 3-year exclusive distribution, no upfront fee**. Take it or leave it.\n\nWhat's your response?",
  vocab_match:
    "🃏 **Vocab Match — Round 1 of 5**\n\nLet's warm up. Explain this term in English OR use it in a sentence:\n\n**pain point**",
  follow_up_email:
    "📝 **Scenario:** You just pitched to **Sarah Chen, Partner at Sequoia Capital**. She seemed interested in your traction numbers but had concerns about market size. She asked you to send more info this week.\n\nWrite a **follow-up email** to Sarah. Send it when ready and I'll review it line by line."
};

export const QUICK_REPLIES: Record<ModeId, string[]> = {
  pitch_drill: [
    "Let me try my pitch now",
    "Show me an example pitch first",
    "I need help with structure"
  ],
  objection_handling: [
    "Give me an easier one to start",
    "I'll defend with traction numbers",
    "Show me a strong sample answer"
  ],
  negotiation_sim: [
    "Counter with better terms",
    "What's a fair industry standard?",
    "Help me phrase a pushback"
  ],
  vocab_match: [
    "I think it means... a customer's problem",
    "Skip this one",
    "Give me a hint"
  ],
  follow_up_email: [
    "Draft an email together with me",
    "What subject line works best?",
    "Show me a template first"
  ]
};
