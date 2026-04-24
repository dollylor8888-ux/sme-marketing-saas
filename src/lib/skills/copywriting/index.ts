/**
 * Copywriting Skill — Generate marketing copy
 * User-facing: ads, emails, social posts, landing pages
 * 
 * Features:
 * - Memory-enhanced prompts (brand voice, product context, preferences)
 * - Few-shot examples for consistent quality
 * - JSON output format for structured results
 * - Tone/style guardrails from user preferences
 */

import OpenAI from "openai";
import { TokenRecord } from "../../billing/token-tracker";
import { MarginRecord, calculateActionMargin } from "../../billing/margin-calculator";
import { SkillCreditCost } from "../../billing/models";
import { buildMemoryContext } from "../../memory/memory-service";

const provider = process.env.AI_PROVIDER ?? "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: provider === "minimax" ? "https://api.minimax.chat/v1" : undefined,
});

export const DEFAULT_MODEL = provider === "minimax"
  ? "abab6-chat"
  : "gpt-4o-mini";

export { openai };

export type CopyType = 
  | "ad_headline" 
  | "ad_description" 
  | "email_subject" 
  | "email_body" 
  | "social_post" 
  | "landing_hero" 
  | "product_description";

export interface CopywritingInput {
  type: CopyType;
  product?: string;
  brand?: string;
  audience?: string;
  tone?: string;
  language?: string;
  extra?: string;
}

export interface CopywritingOutput {
  success: boolean;
  copy?: string;
  variants?: string[];
  structured?: Record<string, string>; // For types that need structured output
  error?: string;
}

// ============ SYSTEM PROMPTS WITH MEMORY & FEW-SHOT ============

function buildSystemPrompt(type: CopyType, memoryContext: string, includeEmoji: boolean): string {
  const baseSystem = getBaseSystemPrompt(type);
  const fewShot = getFewShotExamples(type, includeEmoji);
  const guardrails = getGuardrails(includeEmoji);
  
  return `${baseSystem}

${memoryContext ? `## USER CONTEXT (from memory)
${memoryContext}

---` : ""}

## QUALITY STANDARDS
${fewShot}

${guardrails}

## OUTPUT FORMAT
Return your response as a JSON object with this structure:
{
  "primary": "your best copy option",
  "variants": ["option 2", "option 3"],
  "reasoning": "brief explanation of choices"
}`;
}

function getBaseSystemPrompt(type: CopyType): string {
  const prompts: Record<CopyType, string> = {
    ad_headline: `You are an elite direct-response copywriter specializing in attention-grabbing ad headlines.

Your specialty: Creating headlines that stop scrollers, create curiosity gaps, and drive clicks — all within extreme character limits.

Core principles:
1. BE BENEFIT-FORWARD — Lead with what they GAIN, not features
2. CREATE TENSION — Use contrast, numbers, or specificity to create urgency
3. MATCH INTENT — Headline must match the ad's destination promise
4. ELIMINATE NOISE — No fluff, no generic phrases ("best-in-class", "innovative solutions")

Headlines under 30 characters must be COMPLETE THOUGHTS that sell.

For 30+ character headlines, you have more room for:
- Specificity (numbers, names, results)
- Target qualification (attract right people, repel wrong ones)
- Emotional hooks (curiosity, fear, desire, belonging)`,

    ad_description: `You are an expert copywriter creating persuasive ad descriptions (max 90 characters).

Your job: Complement the headline with specific value proof and call-to-action reinforcement.

Key techniques:
1. ADD PROOF — Numbers, stats, social proof, specific benefits
2. CREATE CONTRAST — Before/after, with/without, old way/new way
3. REINFORCE CTA — Don't just describe, IMPLY the action
4. BE SPECIFIC — "50% faster" beats "faster", "$29" beats "affordable"

Stay under 90 characters. Every character must earn its place.`,

    email_subject: `You are an email marketing expert specializing in subject lines that maximize open rates.

Your specialty: Subject lines that respect the inbox, create curiosity, and deliver on their promise.

Core principles:
1. BE HONEST — Subject must match email content (builds trust + improves deliverability)
2. CREATE CURIOSITY GAPS — Leave unanswered questions
3. USE PREVIEW TEXT — Write subjects that pair well with preview text
4. CONSIDER MOBILE — First 40 characters most critical (show on mobile preview)
5. TEST PERSONALIZATION — [FirstName] works IF authentic, backfires if fake

Format options:
- Direct: "Your trial ends tomorrow"
- Curious: "What 90% of marketers miss..."
- Social proof: "12,000 marketers already..."
- Urgent: "Last chance: 50% off ends tonight"
- Personal: "Saw this and thought of you"`,

    email_body: `You are an expert email copywriter creating emails that drive engagement and conversions.

Your structure:
1. HOOK (first line) — Grab attention, solve a problem, or create curiosity
2. BODY — Build the case with benefits, proof, and emotion
3. CTA — Clear, specific, easy action

Email principles:
1. WRITE FOR SCANNING — Short paragraphs, bullet points, bold key phrases
2. ONE GOAL PER EMAIL — One primary CTA, everything else supports it
3. SOUND HUMAN — Write like you talk, not like corporate marketing
4. BUILD TRUST — Specificity beats superlatives ("since 2019" beats "for years")
5. MOBILE-FIRST — Long paragraphs die on mobile

Avoid:
- ALL CAPS (except true acronyms)
- Exclamation points overuse (1-2 max per email)
- "Click here" CTAs (use specific action verbs)
- Fluff words ("leverage", "synergy", "best-in-class")`,

    social_post: `You are a social media expert creating posts that drive engagement and shares.

Platform considerations:
- LinkedIn: Professional insights, industry tips, thought leadership
- Facebook: Community, lifestyle, entertainment value
- Instagram: Visual storytelling, emojis, lifestyle fit
- Twitter/X: Bite-sized insights, hot takes, threads

Core principles:
1. HOOK IN FIRST LINE — First line determines if they keep reading
2. PROVIDE VALUE — Teach something, challenge assumptions, share insight
3. END WITH ENGAGEMENT — Ask question, invite debate, CTA to comment
4. USE HASHTAGS STRATEGICALLY — 3-5 relevant, 1-2 popular
5. MATCH BRAND VOICE — Be consistent across posts`,

    landing_hero: `You are a conversion copywriter specializing in hero sections that capture attention and drive action.

Your hero section format:
1. HEADLINE (8 words max) — Big promise, specific outcome, emotional hook
2. SUBHEADLINE (16 words max) — Expand on the promise, add proof or context
3. CTA TEXT — Action verb + benefit + urgency (if applicable)

Hero principles:
1. ABOVE THE FOLD MUST POP — Headline and CTA visible without scroll
2. REPLACE "WE ARE" WITH "YOU CAN" — Focus on user transformation
3. USE CONCRETE LANGUAGE — "3x more" beats "significantly more"
4. CREATE VISUAL HIERARCHY — Headline biggest, CTA most prominent
5. BUILD TRUST SIGNALS — Logos, stats, testimonials near CTA

Avoid:
- Clever taglines that don't explain value
- Feature lists in headlines
- Generic "welcome to [company]"`,

    product_description: `You are a product copywriter creating descriptions that highlight benefits and drive sales.

Your approach:
1. LEAD WITH BENEFIT — What does customer GAIN?
2. SUPPORT WITH FEATURES — How do you deliver the benefit?
3. PROVE IT — Social proof, stats, specific differentiators
4. CREATE URGENCY — Why buy NOW?

Product description principles:
1. KNOW YOUR AUDIENCE — Tech specs for developers, benefits for mainstream
2. USE NATURAL LANGUAGE — Don't just list features, explain USE CASE
3. INCLUDE SOCIAL PROOF — "10,000+ happy customers" > "high quality"
4. ADDRESS OBJECTIONS — Include what makes it better than alternatives
5. SEO RELEVANT — Include natural keyword variations

Format for both: short paragraph + bullet highlights + CTA`,
  };

  return prompts[type] ?? "You are an expert marketing copywriter. Create compelling, conversion-focused copy.";
}

function getFewShotExamples(type: CopyType, includeEmoji: boolean): string {
  const emoji = includeEmoji ? "✨" : "";
  
  const examples: Record<CopyType, string> = {
    ad_headline: `## FEW-SHOT EXAMPLES

GOOD (benefit-forward, specific, creates tension):
- "Lose 10lbs in 30 days — no gym required" ${emoji}
- "The $29 alternative to $500 productivity apps"
- "Finally, an ergonomic chair that doesn't look like one"

BAD (generic, feature-forward, no tension):
- "Best-in-class ergonomic chair with advanced features"
- "Buy our high-quality product today"
- "Innovative solution for modern professionals"`,

    ad_description: `## FEW-SHOT EXAMPLES

GOOD (specific, proof-forward, implies action):
- "Trusted by 50,000+ teams. Setup in 5 minutes."
- "No credit card required. Cancel anytime."
- "Join 12,000+ marketers who doubled their ROI"

BAD (generic, feature list, no proof):
- "Our product has many great features"
- "High quality at an affordable price"
- "The best solution for your needs"`,

    email_subject: `## FEW-SHOT EXAMPLES

GOOD (curious, specific, honest):
- "The 1 email trick that doubled our open rates"
- "What 90% of SaaS founders miss about churn"
- "Sarah hit $100k MRR — here's what changed"

BAD (clickbait, misleading, generic):
- "URGENT: Read this immediately!!!"
- "Weekly newsletter #47"
- "Amazing opportunity for you" [lies about content]`,

    email_body: `## FEW-SHOT EXAMPLES

GOOD (scannable, human, value-driven):
"Hey [Name],

Last month I helped a SaaS founder cut his churn from 8% to 3% — using a simple email sequence most people overlook.

The interesting part? It took 2 hours to set up.

[bullet points on what it includes]

Want me to walk you through how it works? Reply "sequences" and I'll send details.

— [Your name]"

BAD (corporate, dense, no value before CTA):
"Dear Valued Customer,

We are excited to announce our new innovative solution designed to help your business achieve its goals. Our platform leverages cutting-edge technology..."

[50 more lines of feature list]

Please click here to learn more. Thank you."`,

    social_post: `## FEW-SHOT EXAMPLES

GOOD (value-first, engaging, authentic voice):
"Most marketers spend 6+ hours on content that gets 0 engagement.

Here's the 20-minute framework that changed everything:

1. [Framework step]
2. [Framework step]
3. [Framework step]

What's your biggest content time sink? 👇"

BAD (promotional, no value, generic):
"🚀 Exciting news! Our new product is now available! Check it out at [link]! #marketing #growth #success"`,

    landing_hero: `## FEW-SHOT EXAMPLES

GOOD (specific, benefit-driven, scannable):
HEADLINE: "Close deals 3x faster with AI-powered outreach"
SUBHEADLINE: "Stop writing cold emails from scratch. Our AI generates personalized sequences in seconds."
CTA: "Start Free Trial →"

BAD (vague, "we are" language):
HEADLINE: "Welcome to Our Innovative Platform"
SUBHEADLINE: "We're dedicated to providing the best solutions for your business needs."
CTA: "Learn More"`,

    product_description: `## FEW-SHOT EXAMPLES

GOOD (benefit-led, specific, scannable):
"Transform your morning chaos into morning flow.

☕ Smart Coffee Maker Pro knows your schedule, adjusts brew time automatically, and wakes you up with the perfect cup — every single morning.

What you'll love:
• Saves 15 min/day on morning routine
• Learns your taste preferences over time  
• One-button operation, zero maintenance

12,000+ 5-star reviews. $149." 

BAD (feature list, no benefits):
"Our product features a smart heating element, a digital display, a 12-cup capacity, a reusable filter, and a one-year warranty."`,
  };

  return examples[type] ?? "";
}

function getGuardrails(includeEmoji: boolean): string {
  const avoidEmoji = includeEmoji ? "" : `
## EMOJI RULES
- Do NOT use emoji in any output
- Do NOT include emoji in copy`;

  return `## GUARDRAILS
- NEVER use ALL CAPS (except true acronyms like SaaS, API, ROI)
- NEVER use more than 2 exclamation points
- NEVER use "click here" — use specific action verbs
- NEVER make claims you can't substantiate
- NEVER use: "best-in-class", "cutting-edge", "revolutionary", "disruptive", "synergy"
${avoidEmoji}`;
}

// ============ MAIN GENERATOR ============

export async function generateCopy(
  input: CopywritingInput,
  userId?: string
): Promise<{
  output: CopywritingOutput;
  tokenRecord?: TokenRecord;
  marginRecord?: MarginRecord;
}> {
  const { type, product, brand, audience, tone = "Professional", language = "English", extra } = input;

  // MOCK MODE — controlled by env var for development
  if (process.env.MOCK_AI === "true") {
    const mockCopy = `[MOCK] ${type} for ${product || "your product"}${brand ? ` by ${brand}` : ""} — Target: ${audience || "everyone"} — Tone: ${tone}`;
    return {
      output: { 
        success: true, 
        copy: mockCopy, 
        variants: [`${mockCopy} (v2)`, `${mockCopy} (v3)`] 
      },
    };
  }

  try {
    // Build memory context if userId provided
    const theUserId = userId ?? "";
    const memoryContext = theUserId
      ? await buildMemoryContext(theUserId, "copywriting", type)
      : "";

    // Check user preferences for emoji
    const includeEmoji = true; // TODO: load from user preferences

    const systemPrompt = buildSystemPrompt(type, memoryContext, includeEmoji);
    const userPrompt = buildUserPrompt(type, { product, brand, audience, tone, language, extra });

    const estimatedInputTokens = Math.ceil((systemPrompt + userPrompt).length / 4);

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 800,
      response_format: { type: "json_object" }, // Enforce JSON output
    });

    const outputText = completion.choices[0]?.message?.content ?? "";
    const usage = completion.usage;

    const inputTokens = usage?.prompt_tokens ?? estimatedInputTokens;
    const outputTokens = usage?.completion_tokens ?? Math.ceil(outputText.length / 4);

    // Parse JSON output
    let parsed: { primary?: string; variants?: string[]; reasoning?: string } = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      // If JSON parse fails, treat entire output as primary
      parsed = { primary: outputText };
    }

    const tokenRecord: TokenRecord = {
      userId: userId ?? "unknown",
      skill: "copywriting",
      actionType: type,
      model: DEFAULT_MODEL,
      inputTokens,
      outputTokens,
      userPaidCredits: SkillCreditCost["copywriting"],
    };

    const marginRecord = calculateActionMargin(tokenRecord);

    return {
      output: {
        success: true,
        copy: parsed.primary ?? outputText,
        variants: parsed.variants,
        structured: parsed as Record<string, string>,
      },
      tokenRecord,
      marginRecord,
    };
  } catch (error) {
    return {
      output: { success: false, error: (error as Error).message || "Unknown error" },
    };
  }
}

// ============ USER PROMPT BUILDER ============

function buildUserPrompt(
  type: CopyType,
  opts: {
    product?: string;
    brand?: string;
    audience?: string;
    tone?: string;
    language?: string;
    extra?: string;
  }
): string {
  const { product, brand, audience, tone, language, extra } = opts;

  const sections: string[] = [];

  if (product) sections.push(`Product: ${product}`);
  if (brand) sections.push(`Brand: ${brand}`);
  if (audience) sections.push(`Target audience: ${audience}`);
  sections.push(`Tone: ${tone}`);
  sections.push(`Language: ${language}`);
  if (extra) sections.push(`Additional context: ${extra}`);

  const typeInstructions: Record<CopyType, string> = {
    ad_headline: "Generate 3 ad headline options. Focus on benefit-forward, specific, tension-creating headlines.",
    ad_description: "Generate 3 ad description options. Each must be under 90 characters. Add specificity and proof.",
    email_subject: "Generate 5 email subject line options. Mix of curious, direct, and social proof approaches.",
    email_body: "Generate a full email body. Include a hook (first line), body (benefits + proof), and clear CTA.",
    social_post: "Generate 3 social media post options. Make them engaging, value-first, and end with engagement CTA.",
    landing_hero: "Generate hero section copy: headline (8 words max), subheadline (16 words max), and CTA text.",
    product_description: "Generate a compelling product description with benefits, features, and call-to-action.",
  };

  return `${sections.join("\n")}

Task: ${typeInstructions[type]}

Remember: Return valid JSON with "primary", "variants", and "reasoning" fields.`;
}
