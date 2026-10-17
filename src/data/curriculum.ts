import { Handshake, Layers, Mail, Mic, Zap } from "lucide-react";
import type { ModeId, PracticeMode, VocabularyEntry } from "../types";

export const MAX_TURNS = 5;

export const MODES: PracticeMode[] = [
  {
    id: "pitch_drill",
    icon: Mic,
    label: "Pitch Drill",
    subtitle: "90-second investor pitch",
    desc: "Бот играет требовательного инвестора. Ты питчишь — он давит вопросами.",
    accent: "#e9c46a"
  },
  {
    id: "objection_handling",
    icon: Zap,
    label: "Objection Handling",
    subtitle: "Defend under pressure",
    desc: "Реальные возражения инвесторов. Учись держать удар на английском.",
    accent: "#f4a261"
  },
  {
    id: "negotiation_sim",
    icon: Handshake,
    label: "Negotiation Sim",
    subtitle: "BATNA · concessions · close",
    desc: "Ролевая игра. Обсуждение условий с международным партнёром.",
    accent: "#e76f51"
  },
  {
    id: "vocab_match",
    icon: Layers,
    label: "Vocab Match",
    subtitle: "Key terminology drill",
    desc: "Отработка ключевой лексики модуля в формате диалога.",
    accent: "#9fb8ad"
  },
  {
    id: "follow_up_email",
    icon: Mail,
    label: "Follow-up Email",
    subtitle: "After-meeting writing",
    desc: "Бот даёт сценарий встречи. Ты пишешь письмо. Он разбирает.",
    accent: "#c89b7b"
  }
];

// The course glossary. Level 2 of the protocol: tooltips show only these definitions, and
// the `en` definitions are given to the model as the reference it must keep to.
// Every term used in the role prompts below must be in this list.
export const VOCABULARY: VocabularyEntry[] = [
  // Pitch
  {
    term: "pain point",
    def: "проблема клиента, которую решает продукт",
    en: "a specific problem customers have that the product solves"
  },
  {
    term: "traction",
    def: "реальные доказательства прогресса (продажи, пилоты, retention)",
    en: "evidence that the product is gaining real customers or revenue"
  },
  {
    term: "hook",
    def: "первый сильный фрагмент питча, захватывающий внимание",
    en: "a strong opening that grabs the listener's attention"
  },
  {
    term: "moat",
    def: "то, что защищает бизнес от конкурентов",
    en: "a lasting competitive advantage that protects the business from competitors"
  },
  {
    term: "ask",
    def: "конкретная просьба к инвестору (встреча, демо, инвестиции)",
    en: "the specific request a founder makes (a meeting, a demo, an investment amount)"
  },
  {
    term: "market size",
    def: "объём рынка",
    en: "the total value or number of potential customers in the target market"
  },
  {
    term: "retention rate",
    def: "процент удерживаемых клиентов",
    en: "the percentage of customers who keep using or paying over a period"
  },
  {
    term: "competitive advantage",
    def: "конкурентное преимущество",
    en: "what makes a company better than its rivals for its customers"
  },
  {
    term: "customer acquisition cost",
    def: "средняя стоимость привлечения одного клиента (CAC)",
    en: "the average cost of winning one new customer (CAC)"
  },
  {
    term: "burn rate",
    def: "скорость расходования денег (обычно в месяц)",
    en: "how fast a company spends its cash, usually per month"
  },
  {
    term: "runway",
    def: "сколько месяцев компания проработает на текущих деньгах при текущих расходах",
    en: "how long a company can operate before its cash runs out at the current burn rate"
  },
  {
    term: "valuation",
    def: "оценка стоимости компании",
    en: "the estimated value of a company"
  },
  {
    term: "lead investor",
    def: "ведущий инвестор раунда",
    en: "the investor who leads a funding round, usually setting the main terms"
  },
  {
    term: "due diligence",
    def: "проверка бизнеса перед сделкой",
    en: "a careful investigation of a business before a deal is signed"
  },
  {
    term: "term sheet",
    def: "предварительное соглашение об основных условиях инвестиции (в основном не имеет обязательной силы)",
    en: "a document setting out the main terms of an investment, mostly non-binding"
  },
  {
    term: "pilot",
    def: "тестовый запуск продукта у клиента",
    en: "a small-scale trial of the product with a customer"
  },
  // Negotiation
  {
    term: "BATNA",
    def: "Best Alternative To a Negotiated Agreement — что ты сделаешь, если сделки не будет",
    en: "Best Alternative To a Negotiated Agreement: what you will do if no deal is reached"
  },
  {
    term: "walk-away point",
    def: "худшие условия, на которые ты ещё согласишься; дальше — выход из переговоров",
    en: "the least favourable terms you will still accept; beyond it you leave the negotiation"
  },
  {
    term: "anchor",
    def: "первое предложение, задающее точку отсчёта в переговорах",
    en: "a first offer or number that sets the reference point for the negotiation"
  },
  {
    term: "concession",
    def: "уступка, сделанная ради сделки",
    en: "something you give up or agree to in order to reach a deal"
  },
  {
    term: "counteroffer",
    def: "встречное предложение",
    en: "an offer made in response to the other side's offer"
  },
  {
    term: "deal breaker",
    def: "условие, из-за которого ты откажешься от сделки",
    en: "a condition that would make you reject the deal"
  },
  {
    term: "win-win",
    def: "взаимовыгодный исход",
    en: "an outcome that benefits both sides"
  },
  {
    term: "exclusivity",
    def: "эксклюзивность: партнёр работает только с тобой на рынке или в течение срока",
    en: "an agreement that one partner deals only with the other in a market or for a period"
  },
  {
    term: "commission",
    def: "комиссия: процент от продаж, который получает партнёр или посредник",
    en: "a percentage of sales paid to a partner or intermediary"
  },
  {
    term: "payment terms",
    def: "условия оплаты (net 90 — оплата в течение 90 дней после счёта)",
    en: "when and how payment is made, e.g. net 90 = payment within 90 days of the invoice"
  },
  // Follow-up email
  {
    term: "follow-up",
    def: "последующий контакт после встречи",
    en: "a message or contact after a meeting"
  },
  {
    term: "subject line",
    def: "тема письма",
    en: "the title of an email that the recipient sees first"
  },
  {
    term: "call to action",
    def: "призыв к действию: конкретный следующий шаг для адресата",
    en: "a clear next step you ask the reader to take"
  }
];

export const PITCH_FRAMEWORK = {
  P: { label: "Problem", description: "Боль клиента. Начни с проблемы, а не с себя." },
  I: { label: "Impact / Solution", description: "Твоё решение и его эффект." },
  T: { label: "Traction", description: "Цифры: продажи, пилоты, удержание." },
  C: { label: "Competition / Moat", description: "Чем ты уникален vs конкуренты." },
  H: { label: "Hook / Ask", description: "Конкретный запрос: встреча, демо, инвестиции." }
} as const;

export const SYSTEM_PROMPTS: Record<ModeId, string> = {
  pitch_drill: `You are Alex Chen, a sharp partner at Alder Peak Ventures (a fictional fund). You're evaluating startup pitches between back-to-back meetings. Direct, time-pressed, skeptical but fair.

RULES:
1. Always respond in English. Keep messages under 80 words unless giving final feedback.
2. Ask ONE tough follow-up question per turn (burn rate, retention, moat, competitive advantage, customer acquisition cost, runway).
3. Push back on vague answers. Demand specific numbers.
4. Use vocabulary from this list naturally: traction, moat, ask, hook, pain point, market size, retention rate, runway, valuation.
5. After 4 user messages, give final structured feedback:
   ✅ **What worked:** (quote specific phrases they used)
   ⚠️ **What to improve:** (rewrite one weak sentence)
   📚 **Vocabulary tip:** (1-2 terms they should add)
6. Be encouraging but honest. No sugarcoating.`,

  objection_handling: `You are a tough but fair investor running an objection drill. Throw realistic investor objections one at a time.

RULES:
1. Each message: ONE objection in English, under 50 words.
2. After user responds, rate their answer with an emoji at the start:
   🟢 Strong — they handled it well
   🟡 Needs work — partial answer
   🔴 Missed — didn't address the real concern
3. Give a one-sentence tip if 🟡 or 🔴.
4. Then throw the NEXT objection.
5. After 4 exchanges, summarize with 2 strongest moments and 2 phrases to learn.
6. Objection bank: crowded market, weak moat, optimistic numbers, no real customers, expensive vs alternatives, team gaps, timing risk.`,

  negotiation_sim: `You are Marcus Weber, VP of Partnerships at Continental Distribution — a fictional European retailer with 500 stores. You're negotiating a deal with the user's startup.

RULES:
1. Start with unfavourable terms: 40% commission, 3-year exclusive, payment in 90 days.
2. Respond realistically to counter-proposals. Make small concessions only if pressured.
3. Use negotiation vocabulary: BATNA, walk-away point, concession, anchor, deal breaker, win-win.
4. Stay in character — slightly cold, professional German style.
5. After 4-5 exchanges, drop character and give feedback:
   - 2 phrases the user said well
   - 2 phrases that sounded unnatural or too aggressive
   - 3 better alternatives with examples
6. Keep responses under 70 words.`,

  vocab_match: `You are an engaging business English coach running a vocabulary game called "Vocab Match" — 5 rounds.

RULES:
1. Present ONE term per round from this list: traction, moat, ask, hook, pain point, BATNA, retention rate, market size, burn rate, valuation.
2. Ask the user to either (a) explain the term in English OR (b) use it in a sentence about their business.
3. Evaluate clearly:
   ✅ Spot on — explain WHY it's correct
   ⚠️ Close — show the nuance they missed
   ❌ Off — give correct usage with example
4. After 5 rounds, give a score: "X/5 mastered" and recommend 1-2 terms to review.
5. Tone: gamified, energetic, like a quiz show host. Use English only.
6. Keep each message under 60 words.`,

  follow_up_email: `You are a senior business English writing coach.

RULES:
1. After the user submits their email, evaluate on these dimensions:
   📧 **Subject line:** specific or generic?
   👋 **Opening:** professional, warm, with context?
   💡 **Key points:** did they address concerns raised in the meeting?
   🎯 **Call to action:** clear next step?
   🎨 **Tone:** confident but not pushy?
2. Quote specific lines from their email. Rewrite weak sentences with improvements.
3. Highlight 2 phrases they used well.
4. End with a corrected version of the most important sentence.
5. Be specific. No generic advice.
6. Use English for the analysis. Keep response structured with the emoji headers above.`
};

export const OPENERS: Record<ModeId, string> = {
  pitch_drill:
    "Hi. I'm Alex Chen, partner at Alder Peak Ventures. I've got 90 seconds between meetings. Tell me about your startup — and please, start with the **problem**, not with yourself.\n\nGo.",
  objection_handling:
    "Welcome to the hot seat. I'll throw one investor objection at a time. You defend.\n\n**Objection #1:**\n\n*\"Your market is too crowded. What stops a well-funded incumbent from killing you in the next 12 months?\"*\n\nYour move.",
  negotiation_sim:
    "I'm Marcus Weber, VP of Partnerships at Continental Distribution. We move products through **500 retail stores across Europe**. I've read your pitch — interesting, but I have concerns.\n\nMy opening terms: **40% commission**, **3-year exclusive**, **net-90 payment**.\n\nLet's talk. What's your response?",
  vocab_match:
    "Welcome to **Vocab Match** — 5 rounds of business English from the Pitch & Negotiations module.\n\nI give you a term. You use it in a sentence about your real or imagined startup. I evaluate.\n\n**Round 1 · *traction***\n\nGive me a sentence.",
  follow_up_email:
    "**Scenario:**\n\nYou just pitched to **Sarah Lind, Partner at Harbor Point Capital**. She seemed engaged when you mentioned your 92% retention rate but raised concerns about market size in EMEA. She asked you to send more info — but didn't commit to a next meeting.\n\n**Your task:** Write the follow-up email. Subject line + body. I'll critique it line by line.\n\nGo ahead."
};
