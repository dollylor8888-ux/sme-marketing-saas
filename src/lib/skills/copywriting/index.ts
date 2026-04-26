/**
 * Copywriting Skill — Expanded to 20+ types based on marketingskills frameworks
 * Organized by: Headlines, CTA, Page Copy, Email/Ads, Product
 * 
 * Based on:
 * - https://github.com/coreyhaines31/marketingskills (copywriting, copy-editing)
 * - Headline formulas, CTA rules, page structure frameworks
 * - Seven Sweeps editing principles
 */

import OpenAI from "openai";
import { TokenRecord } from "../../billing/token-tracker";
import { MarginRecord, calculateActionMargin } from "../../billing/margin-calculator";
import { SkillCreditCost } from "../../billing/models";
import { buildMemoryContext, loadMemoryContext } from "../../memory/memory-service";

const provider = process.env.AI_PROVIDER ?? "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: provider === "minimax" ? "https://api.minimax.chat/v1" : undefined,
});

export const DEFAULT_MODEL = provider === "minimax"
  ? "abab6-chat"
  : "gpt-4o-mini";

export { openai };

// ============ EXPANDED COPY TYPES ============

export type CopyType =
  // --- Headlines (6 types) ---
  | "hook_statement"
  | "headline_outcome"
  | "headline_problem"
  | "headline_question"
  | "headline_differentiation"
  | "headline_social_proof"
  // --- CTA (4 types) ---
  | "cta_primary"
  | "cta_secondary"
  | "cta_urgency"
  | "cta_objection_handling"
  // --- Page Copy (6 types) ---
  | "hero_section"
  | "landing_page"
  | "about_story"
  | "pricing_value"
  | "feature_benefit"
  | "testimonial_intro"
  // --- Email & Ads (5 types) ---
  | "email_subject"
  | "email_body"
  | "ad_facebook"
  | "ad_google"
  | "ad_linkedin"
  // --- Product (3 types) ---
  | "product_description"
  | "product_benefits"
  | "use_case_narrative"
  // --- Strategy (1 type) ---
  | "ad_direction";

export interface FineTuneOptions {
  length?: "shorter" | "same" | "longer";
  tone?: "professional" | "casual" | "bold" | "reserved";
  focus?: "value" | "quality" | "emotion" | "urgency";
  format?: "same" | "bullet" | "paragraph" | "conversational";
  language?: string;
  customInstruction?: string;
}

export interface CopywritingInput {
  type: CopyType;
  product?: string;
  brand?: string;
  audience?: string;
  tone?: string;
  language?: string;
  extra?: string;
  /**  Fine-tune the previous output */
  fineTune?: FineTuneOptions;
  /**  Required when fineTune is set — the copy text to refine */
  previousOutput?: string;
}

export interface CopywritingOutput {
  success: boolean;
  copy?: string;
  variants?: string[];
  structured?: Record<string, string>;
  error?: string;
}

// ============ COPY TYPE METADATA ============

export interface CopyTypeMeta {
  category: "headlines" | "cta" | "page" | "email_ads" | "product" | "strategy";
  name: string;
  description: string;
  characterLimit?: number;
  exampleFormula?: string;
}

export const COPY_TYPE_META: Record<CopyType, CopyTypeMeta> = {
  // HEADLINES
  hook_statement: {
    category: "headlines",
    name: "Hook Statement",
    description: "Attention-grabbing opening that stops the scroll",
    characterLimit: 30,
    exampleFormula: "{Bold claim} + {specificity}"
  },
  headline_outcome: {
    category: "headlines",
    name: "Outcome Headline",
    description: "Promise a specific result or transformation",
    characterLimit: 60,
    exampleFormula: "{Achieve outcome} + {without pain point}"
  },
  headline_problem: {
    category: "headlines",
    name: "Problem Headline",
    description: "Highlight the pain point they're experiencing",
    characterLimit: 60,
    exampleFormula: "Never {unpleasant event} again"
  },
  headline_question: {
    category: "headlines",
    name: "Question Headline",
    description: "Ask a question that resonates with their situation",
    characterLimit: 60,
    exampleFormula: "{Question about their main pain point}?"
  },
  headline_differentiation: {
    category: "headlines",
    name: "Differentiation Headline",
    description: "Stand out from competitors with unique positioning",
    characterLimit: 60,
    exampleFormula: "The {opposite of usual} way to {outcome}"
  },
  headline_social_proof: {
    category: "headlines",
    name: "Social Proof Headline",
    description: "Use numbers and credibility to build trust",
    characterLimit: 60,
    exampleFormula: "{Number} {people} use {product} to {outcome}"
  },
  // CTA
  cta_primary: {
    category: "cta",
    name: "Primary CTA",
    description: "Main action button — be specific about what they get",
    exampleFormula: "{Action Verb} + {What They Get}"
  },
  cta_secondary: {
    category: "cta",
    name: "Secondary CTA",
    description: "Less committal option for hesitant visitors"
  },
  cta_urgency: {
    category: "cta",
    name: "Urgency CTA",
    description: "Create time-sensitive motivation to act now"
  },
  cta_objection_handling: {
    category: "cta",
    name: "Objection-Handling CTA",
    description: "Address common hesitations in the CTA itself"
  },
  // PAGE COPY
  hero_section: {
    category: "page",
    name: "Hero Section",
    description: "Full above-the-fold: headline + subheadline + CTA"
  },
  landing_page: {
    category: "page",
    name: "Landing Page",
    description: "Complete landing page with all core sections"
  },
  about_story: {
    category: "page",
    name: "About/Origin Story",
    description: "Brand story that connects mission to customer benefit"
  },
  pricing_value: {
    category: "page",
    name: "Pricing Value Prop",
    description: "Help visitors choose the right plan with clear value"
  },
  feature_benefit: {
    category: "page",
    name: "Feature → Benefit",
    description: "Connect features to tangible outcomes"
  },
  testimonial_intro: {
    category: "page",
    name: "Testimonial Format",
    description: "Format testimonials for maximum impact"
  },
  // EMAIL & ADS
  email_subject: {
    category: "email_ads",
    name: "Email Subject",
    description: "Maximize open rates with compelling subject lines"
  },
  email_body: {
    category: "email_ads",
    name: "Email Body",
    description: "Full email with hook, body, and clear CTA"
  },
  ad_facebook: {
    category: "email_ads",
    name: "Facebook/Instagram Ad",
    description: "Attention-grabbing ad copy for Meta platforms"
  },
  ad_google: {
    category: "email_ads",
    name: "Google Ads",
    description: "Headlines + descriptions for Google Ads"
  },
  ad_linkedin: {
    category: "email_ads",
    name: "LinkedIn Ad",
    description: "Professional B2B ad copy for LinkedIn"
  },
  // PRODUCT
  product_description: {
    category: "product",
    name: "Product Description",
    description: "Compelling description with benefits and proof"
  },
  product_benefits: {
    category: "product",
    name: "Benefits List",
    description: "Benefit statements that speak to customer outcomes"
  },
use_case_narrative: {
    category: "product",
    name: "Use Case Story",
    description: "Narrative showing product in real-life situation"
  },
  ad_direction: {
    category: "strategy",
    name: "Ad Direction Strategy",
    description: "AI-generated ad direction suggestions with audience, creative approach, and budget allocation"
  }
};

// ============ SYSTEM PROMPTS WITH MARKETINGSKILLS FRAMEWORKS ============

function buildSystemPrompt(type: CopyType, memoryContext: string, includeEmoji: boolean): string {
  const baseSystem = getBaseSystemPrompt(type);
  const frameworks = getFrameworks(type);
  const fewShot = getFewShotExamples(type, includeEmoji);
  const guardrails = getGuardrails(includeEmoji);
  const meta = COPY_TYPE_META[type];
  
  return `${baseSystem}

${meta.exampleFormula ? `## HEADLINE FORMULA (from marketingskills)
Formula: ${meta.exampleFormula}
` : ""}

${memoryContext ? `## USER CONTEXT (from Memory)
${memoryContext}

---` : ""}

${frameworks}

## QUALITY STANDARDS
${fewShot}

${guardrails}

## OUTPUT FORMAT
Return your response as JSON:
{
  "primary": "your best option",
  "variants": ["option 2", "option 3"],
  "reasoning": "brief explanation of approach"
}`;
}

function getBaseSystemPrompt(type: CopyType): string {
  const category = COPY_TYPE_META[type].category;
  
  const categoryBase = {
    headlines: `You are an elite direct-response copywriter specializing in headlines and hooks.

Your specialty: Creating headlines that stop scrollers, create curiosity gaps, and drive action — all within character limits.

Core principles (from marketingskills):
1. BE BENEFIT-FORWARD — Lead with what they GAIN, not features
2. CREATE TENSION — Use contrast, numbers, or specificity
3. BE SPECIFIC — "Save 5 hours/week" > "save time"
4. USE CUSTOMER LANGUAGE — Mirror how customers describe their problem
5. ONE IDEA PER HEADLINE — Don't try to say everything`,
    
    cta: `You are a CTA optimization expert.

Your specialty: Action-oriented button text that communicates value, not just "Submit" or "Sign Up".

Core principles (from marketingskills):
1. ACTION VERB FIRST — Start with what they DO: "Start", "Get", "Download", "Create"
2. COMMUNICATE VALUE — What do they GET? "Start Free Trial" > "Sign Up"
3. CREATE SPECIFICITY — "Start My Free Trial" > "Get Started"
4. CONSIDER URGENCY — For time-sensitive offers: "Start Now" > "Get Started"

Formula: [Action Verb] + [What They Get] + [Qualifier if needed]

Strong CTAs: "Start Free Trial", "Get the Complete Checklist", "See Pricing for My Team"
Weak CTAs: "Submit", "Sign Up", "Learn More", "Click Here", "Get Started"`,
    
    page: `You are a conversion copywriter specializing in marketing pages.

Your specialty: Writing page copy that guides visitors toward action through clear, compelling narrative.

Core principles (from marketingskills copywriting):
1. CLARITY OVER CLEVERNESS — If you have to choose, choose clear
2. BENEFITS OVER FEATURES — Features: what it does. Benefits: what that means
3. SPECIFICITY OVER VAGUENESS — "Save 15 min/day" > "save time"
4. ONE IDEA PER SECTION — Each section advances one argument
5. CUSTOMER LANGUAGE — Use words customers use, not company speak

Page Structure (from marketingskills):
- Hero: Headline + Subheadline + Primary CTA
- Social Proof: Build credibility (logos, stats, testimonials)
- Problem/Pain: Show you understand their situation
- Solution/Benefits: 3-5 key benefits (not 10)
- How It Works: 3-4 steps, reduce complexity
- Objection Handling: FAQ, comparisons, guarantees
- Final CTA: Recap value, repeat CTA, risk reversal`,
    
    email_ads: `You are an expert in email and ad copywriting.

Your specialty: Creating compelling, conversion-focused copy for digital advertising and email marketing.

Core principles:
1. HOOK IN FIRST LINE — First line determines if they keep reading
2. BE DIRECT — Get to the point, don't bury the value
3. CREATE CURIOSITY — Leave unanswered questions
4. SOUND HUMAN — Write like you talk, not corporate marketing
5. ONE GOAL — One primary action per piece`,
    
product: `You are a product copywriter creating descriptions that sell.

Your specialty: Turning features into benefits and outcomes customers care about.

Core principles (from marketingskills):
1. LEAD WITH BENEFIT — What does customer GAIN?
2. SUPPORT WITH FEATURES — How do you deliver the benefit?
3. PROVE IT — Social proof, stats, differentiators
4. USE CASE — Don't just list features, explain HOW it helps
5. SO WHAT TEST — Every claim should answer "so what?"`,
    
    strategy: `You are a Facebook/Instagram advertising strategy expert.

Your specialty: Creating effective ad directions that resonate with target audiences and drive conversions.

Core principles (from marketingskills):
1. AUDIENCE FIRST — Know who you're talking to before creating messages
2. ONE MESSAGE PER AD — Don't try to say everything
3. EMOTION + LOGIC — Best ads appeal to both heart and mind
4. CONTEXT MATTERS — Match creative to platform culture
5. TEST & LEARN — Structure for testing, optimize for performance`
  };
 
  return categoryBase[category];
}

function getFrameworks(type: CopyType): string {
  const frameworks: Partial<Record<CopyType, string>> = {
    // HEADLINE FORMULAS (from marketingskills/copy-frameworks.md)
    hook_statement: `## HOOK FRAMEWORKS
Use these formulas for attention-grabbing hooks:
- {Specific number} + {outcome}: "50,000 marketers use Drip to send better emails"
- {Bold claim} + {specificity}: "The $29 alternative to $500 apps"
- {Contrast} + {benefit}: "Finally, an ergonomic chair that doesn't look like one"
- {Question} + {implied answer}: "Hate returning stuff to Amazon?"`,
    
    headline_outcome: `## OUTCOME-FOCUSED FORMULAS
- {Achieve desirable outcome} without {pain point}
  "Understand how users experience your site without drowning in numbers"
- {Achieve outcome} by {how product makes it possible}
  "Generate more leads by seeing which companies visit your site"
- {Achieve outcome} in {timeframe}
  "Get your tax refund in 10 days"
- Turn {input} into {outcome}
  "Turn hard-earned sales into repeat customers"`,
    
    headline_problem: `## PROBLEM-FOCUSED FORMULAS
- Never {unpleasant event} again
  "Never miss a sales opportunity again"
- {Question highlighting main pain point}
  "Hate returning stuff to Amazon?"
- Stop {pain}. Start {pleasure}.
  "Stop chasing invoices. Start getting paid on time."`,
    
    headline_question: `## QUESTION-BASED FORMULAS
- {What if} + {desirable outcome}?
  "What if you could close deals 30% faster?"
- {Embedded question about pain}
  "Why are 90% of SaaS founders losing customers to churn?"
- {Would you} + {scenario}?
  "Would you pay $29 to save 5 hours every week?"`,
    
    headline_differentiation: `## DIFFERENTIATION FORMULAS
- The {opposite of usual process} way to {outcome}
  "The easiest way to turn your passion into income"
- The {category} that {key differentiator}
  "The CRM that updates itself"
- Finally, {category} that {benefit}
  "Finally, accounting software that doesn't suck"
- {What if you could} + {different approach}?
  "What if you could build websites without writing code?"`,
    
    headline_social_proof: `## SOCIAL PROOF FORMULAS
- {Number} + {people} + {use/action} + {outcome}
  "50,000 marketers use Drip to send better emails"
- {Key benefit} + {proof}
  "Sound clear in online meetings"
- {Metric} + {context}
  "$2M saved for our customers last year"
- {Recognition} + {credibility}
  "Trusted by teams at Stripe, Shopify, and Notion"`,
    
    // CTA FRAMEWORKS
    cta_primary: `## CTA FORMULA (from marketingskills)
Formula: [Action Verb] + [What They Get] + [Qualifier if needed]

Strong examples:
- "Start My Free Trial"
- "Get the Complete Checklist"
- "See Pricing for My Team"
- "Create Your First Campaign"
- "Download the Free Guide"

Weak to avoid: "Submit", "Sign Up", "Learn More", "Click Here", "Get Started"`,
    
    cta_urgency: `## URGENCY CTA FORMULAS
- {Time pressure} + {action} + {benefit}
  "Start your free trial before offer expires"
- {Limited quantity} + {action}
  "Claim your spot — only 50 left"
- {Immediate outcome} + {action}
  "Get access instantly — no waiting"

Urgency techniques:
- Deadline: "Offer ends Friday"
- Scarcity: "Only 10 spots left"
- Immediacy: "Start now, results in minutes"
- Growth: "Before your competition does"`,
    
    cta_objection_handling: `## OBJECTION-HANDLING CTA FORMULAS
Address the "Is this right for me?" hesitation:

- Risk reversal: "Start Free — Cancel Anytime"
- Qualification: "See If We're Right for You"
- Social proof: "Join 10,000+ Teams Already Using Us"
- Effort objection: "No credit card required. 2-minute setup."
- Outcome: "Get Results or Your Money Back"`,
    
    // PAGE COPY STRUCTURES
    hero_section: `## HERO SECTION STRUCTURE (from marketingskills)

Format:
HEADLINE (8 words max): Big promise, specific outcome, emotional hook
SUBHEADLINE (16 words max): Expand on promise, add proof or context
PRIMARY CTA: Action verb + what they get
SUPPORTING VISUAL: Product screenshot or hero image

Formulas:
- "{Achieve outcome} without {pain point}"
- "The {category} for {audience}"
- "Never {unpleasant event} again"
- "{Question highlighting main pain point}?"

Example:
Headline: "Close deals 3x faster with AI-powered outreach"
Subheadline: "Stop writing cold emails from scratch. Our AI generates personalized sequences in seconds."
CTA: "Start Free Trial →"`,
    
    landing_page: `## LANDING PAGE STRUCTURE (from marketingskills)

Strong narrative structure:
1. Hero (headline + subhead + CTA)
2. Social Proof Bar (logos or stats)
3. Problem/Pain section (articulate their problem)
4. How It Works (3 steps)
5. Key Benefits (2-3, not 10)
6. Testimonial
7. Use Cases or Personas
8. Comparison to alternatives
9. FAQ
10. Final CTA with guarantee

This tells a story and addresses objections.`,
    
    feature_benefit: `## FEATURE → BENEFIT → OUTCOME FRAMEWORK

For each feature, complete this chain:
FEATURE: What it does
BENEFIT: What that means for the customer
OUTCOME: The end result they achieve

Example:
Feature: "AI-powered analytics"
Benefit: "Surfaces insights you'd miss manually"
Outcome: "Make better decisions in half the time"

"The So What Test" (from marketingskills Seven Sweeps):
For every statement, ask "Okay, so what?"
If copy doesn't answer, it needs work.`,
    
    // EMAIL FRAMEWORKS
    email_body: `## EMAIL STRUCTURE (from marketingskills)

Format:
1. HOOK (first line): Grab attention, solve problem, create curiosity
2. BODY: Build case with benefits, proof, emotion
3. CTA: Clear, specific, easy action

Email principles:
- Write for scanning (short paragraphs, bullets, bold key phrases)
- One goal per email (one primary CTA)
- Sound human (write like you talk)
- Mobile-first (long paragraphs die on mobile)
- Be direct (get to the point)`,
    
    ad_facebook: `## FACEBOOK/INSTAGRAM AD STRUCTURE

Format:
1. HOOK (first line): Stop the scroll
2. BODY: Build desire, add proof
3. CTA: Clear action

Meta considerations:
- Mobile-first (short, scannable)
- Use curiosity gaps
- Include social proof when possible
- Eye-catching but not misleading
- Match headline to landing page promise`,
    
    ad_google: `## GOOGLE ADS STRUCTURE

You provide:
- 3 Headlines (30 chars each)
- 2 Descriptions (90 chars each)

Headline rules:
- Include keywords
- Highlight unique value
- Use numbers when possible
- Match user search intent

Description rules:
- Expand on headlines
- Include call-to-action
- Add specificity (prices, timeframes)
- Address objections`,
    
    ad_linkedin: `## LINKEDIN AD STRUCTURE

B2B considerations:
- Professional tone but not corporate
- Address business problems
- Focus on ROI, efficiency, results
- Credibility signals (company, role)

Format:
1. Hook: Problem or insight
2. Body: Solution + proof
4. CTA: Clear business action`,
    
    // AD DIRECTION FRAMEWORKS
    ad_direction: `## AD DIRECTION FRAMEWORK

Generate 2-3 distinct ad directions that cover different audience segments or creative approaches.

For each direction provide:
1. **Name** - Memorable, strategic name
2. **Strategy** - Core strategic rationale
3. **Target Audience** - Demographics, interests, behaviors
4. **Creative Direction** - Visual style, emotional appeal, key message
5. **Platform** - Facebook, Instagram, or Both
6. **AdSet Count** - How many ad sets for this direction (1-2 recommended)
7. **Budget Allocation** - Suggested % of total budget

Prioritize variety in:
- Audience segments (age, gender, interests)
- Creative approaches (lifestyle vs product-focused, emotional vs rational)
- Funnel stages (awareness vs conversion)`,

    // PRODUCT FRAMEWORKS
    use_case_narrative: `## USE CASE NARRATIVE FRAMEWORK

Structure:
1. SITUATION: Set the scene with a relatable problem
2. DISCOVERY: How they found the product
3. EXPERIENCE: What using it was like
4. RESULT: The tangible outcome they achieved

"The So What Test" — Every claim must answer: "So what does that mean for me?"
Use specific metrics and outcomes over vague praise.`,
  };
 
  return frameworks[type] || "";
}

function getFewShotExamples(type: CopyType, includeEmoji: boolean): string {
  const emoji = includeEmoji ? "✨" : "";
  
  const examples: Partial<Record<CopyType, string>> = {
    hook_statement: `## FEW-SHOT EXAMPLES

GOOD (specific, creates tension):
- "Lose 10lbs in 30 days — no gym required" ${emoji}
- "The $29 alternative to $500 productivity apps"
- "Finally, an ergonomic chair that doesn't look like one"

BAD (generic, feature-forward):
- "Best-in-class ergonomic chair with advanced features"
- "Buy our high-quality product today"
- "Innovative solution for modern professionals"`,

    headline_outcome: `## FEW-SHOT EXAMPLES

GOOD (benefit-forward, specific):
- "Save 5 hours every week — starting today"
- "Cut your reporting time from 4 hours to 15 minutes"
- "Double your email open rates in 30 days"

BAD (vague, no specifics):
- "Save time and be more productive"
- "Get better results with our tool"
- "Improve your marketing performance"`,

    headline_problem: `## FEW-SHOT EXAMPLES

GOOD (creates recognition, shows understanding):
- "Hate chasing clients for payment?"
- "Tired of writing cold emails that get ignored?"
- "Stop losing leads because your follow-up is too slow"

BAD (too generic, not specific):
- "Having problems? We can help"
- "Streamline your workflow"
- "The solution you've been looking for"`,

    headline_question: `## FEW-SHOT EXAMPLES

GOOD (resonates, creates curiosity):
- "What if you could close deals 30% faster?"
- "Would you pay $29 to save 5 hours every week?"
- "Why are 90% of SaaS startups failing at churn?"

BAD (too broad, no insight):
- "Want to grow your business?"
- "Are you looking for a better solution?"
- "Have you tried our product yet?"`,

    headline_differentiation: `## FEW-SHOT EXAMPLES

GOOD (unique positioning):
- "The only CRM that updates itself"
- "Finally, accounting software that doesn't suck"
- "The Tinder for recruiting (minus the awkwardness)"

BAD (generic positioning):
- "Best-in-class solution for businesses"
- "The next generation of productivity tools"
- "We help you succeed"`,

    headline_social_proof: `## FEW-SHOT EXAMPLES

GOOD (specific numbers, credible):
- "50,000 marketers use this to send better emails"
- "$2M saved for our customers last year"
- "Trusted by teams at Stripe, Shopify, Notion"

BAD (vague social proof):
- "Used by thousands of happy customers"
- "Award-winning platform"
- "Loved by businesses everywhere"`,

    cta_primary: `## FEW-SHOT EXAMPLES

GOOD (specific action + value):
- "Start My Free Trial"
- "Get the Complete Marketing Checklist"
- "See Pricing for My Team Size"
- "Create Your First Campaign"

BAD (generic, no value):
- "Submit"
- "Sign Up"
- "Learn More"
- "Get Started"`,

    cta_secondary: `## FEW-SHOT EXAMPLES

GOOD (softer commitment, still valuable):
- "Watch the Demo"
- "See How It Works"
- "Browse Features"
- "Compare Plans"
- "Read Case Studies"

BAD (too vague or committal):
- "Submit"
- "Yes, I Agree"
- "Continue"`,
    
    cta_urgency: `## FEW-SHOT EXAMPLES

GOOD (time-sensitive, specific):
- "Claim Your Spot — Offer Ends Friday"
- "Start Before the Price Increase"
- "Get Instant Access — 50 Spots Left"
- "Lock In Your Rate — Expires Tonight"

BAD (fake urgency):
- "Limited Time Offer!" (no specific time)
- "Act Now!" (no reason why)
- "Don't Miss Out!" (on what?)`,

    cta_objection_handling: `## FEW-SHOT EXAMPLES

GOOD (addresses specific objection):
- "Start Free Trial — Cancel Anytime"
- "No Credit Card Required. See Results Free."
- "Join 10,000+ Teams. Cancel Anytime."
- "Get Results or Your Money Back. No Questions."

BAD (ignores objections):
- "Get Started Now"
- "Sign Up for Free"
- "Submit"`,
    
    hero_section: `## FEW-SHOT EXAMPLES

GOOD (specific, benefit-driven):
HEADLINE: "Close deals 3x faster with AI-powered outreach"
SUBHEADLINE: "Stop writing cold emails from scratch. Our AI generates personalized sequences in seconds."
CTA: "Start Free Trial →"

BAD (vague, "we are" language):
HEADLINE: "Welcome to Our Innovative Platform"
SUBHEADLINE: "We're dedicated to providing the best solutions for your business needs."
CTA: "Learn More"`,

    landing_page: `## FEW-SHOT EXAMPLES

GOOD (narrative structure):
1. Hero: Clear promise
2. Social proof: "Trusted by 10,000+ teams"
3. Problem: "Still sending cold emails that get ignored?"
4. Solution: How your product solves it
5. Benefits: 3 key outcomes
6. Testimonial: Specific results
7. FAQ: Address objections
8. Final CTA: Recap + risk reversal

BAD (feature dump):
1. Hero: Vague tagline
2-10. Feature list with no narrative
11. "Buy Now"`,

    email_body: `## FEW-SHOT EXAMPLES

GOOD (scannable, human, value-driven):
"Hey [Name],

Last month I helped a SaaS founder cut his churn from 8% to 3% — using a simple email sequence most people overlook.

The interesting part? It took 2 hours to set up.

What's the #1 challenge you're facing with customer retention right now?

— [Your name]"

BAD (corporate, dense):
"Dear Valued Customer,

We are excited to announce our new innovative solution designed to help your business achieve its goals. Our platform leverages cutting-edge technology...

[50 more lines of feature list]

Please click here to learn more. Thank you."`,

    ad_facebook: `## FEW-SHOT EXAMPLES

GOOD (scroll-stopper + proof):
"Hate returning stuff to Amazon? 
We made returns free — and actually enjoyable.
Join 50,000+ shoppers who never stress about returns again.
👇 Try it free"

BAD (generic, no hook):
"Our new product is amazing! Check it out at our website! #shopping #deals"`,
    
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
"Our product features a smart heating element, a digital display, a 12-cup capacity, a reusable filter, and a one-year warranty."`
  };
  
  return examples[type] || "";
}

function getGuardrails(includeEmoji: boolean): string {
  const avoidEmoji = includeEmoji ? "" : `
## EMOJI RULES
- Do NOT use emoji in any output
- Do NOT include emoji in copy`;

  return `## GUARDRAILS (from marketingskills)
- NEVER use ALL CAPS (except true acronyms: SaaS, API, ROI, CRM)
- NEVER use more than 2 exclamation points
- NEVER use "click here" — use specific action verbs
- NEVER make claims you can't substantiate
- NEVER use: "best-in-class", "cutting-edge", "revolutionary", "disruptive", "synergy"
- ALWAYS be specific — "15 min" beats "fast", "$29" beats "affordable"
- ALWAYS answer "so what?" for every claim you make
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
  const { type, product, brand, audience, tone = "Professional", language = "English", extra, fineTune, previousOutput } = input;

  // MOCK MODE (MiniMax API key issue)
  if (true) {
    const meta = COPY_TYPE_META[type];
    let mockCopy = `[MOCK] ${meta.name} for ${product || "your product"}${brand ? ` by ${brand}` : ""} — Target: ${audience || "everyone"} — Tone: ${tone}`;

    // Apply fine-tune mock transformations
    if (fineTune) {
      const adjustments: string[] = [];
      if (fineTune.length === "shorter") adjustments.push("(shortened)");
      if (fineTune.length === "longer") adjustments.push("(expanded)");
      if (fineTune.tone) adjustments.push(`tone→${fineTune.tone}`);
      if (fineTune.focus) adjustments.push(`focus→${fineTune.focus}`);
      if (fineTune.format && fineTune.format !== "same") adjustments.push(`format→${fineTune.format}`);
      if (fineTune.language && fineTune.language !== language) adjustments.push(`lang→${fineTune.language}`);
      if (fineTune.customInstruction) adjustments.push(`"${fineTune.customInstruction}"`);
      mockCopy = mockCopy + " " + adjustments.join(" | ");
    }

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
    const loaded = theUserId ? await loadMemoryContext(theUserId) : null;
    const memoryContext = buildMemoryContext(loaded);

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
      max_tokens: 1000,
      response_format: { type: "json_object" },
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
  const meta = COPY_TYPE_META[type];

  const sections: string[] = [];

  if (product) sections.push(`Product: ${product}`);
  if (brand) sections.push(`Brand: ${brand}`);
  if (audience) sections.push(`Target audience: ${audience}`);
  sections.push(`Tone: ${tone}`);
  sections.push(`Language: ${language}`);
  if (extra) sections.push(`Additional context: ${extra}`);
  if (meta.characterLimit) sections.push(`Character limit: ${meta.characterLimit}`);

  const typeInstructions: Partial<Record<CopyType, string>> = {
    // HEADLINES
    hook_statement: "Generate 3 hook statement options. Focus on bold claims, specific numbers, or attention-grabbing openings. Max 30 characters each.",
    headline_outcome: "Generate 3 outcome-focused headline options. Use formulas like '{Achieve outcome} without {pain point}'. Max 60 characters each.",
    headline_problem: "Generate 3 problem-focused headline options. Use formulas like 'Never {unpleasant event} again' or 'Stop {pain}. Start {pleasure}'. Max 60 characters.",
    headline_question: "Generate 3 question-based headline options. Create curiosity and resonate with their situation. Max 60 characters.",
    headline_differentiation: "Generate 3 differentiation headline options. Stand out with unique positioning. Max 60 characters.",
    headline_social_proof: "Generate 3 social proof headline options. Use specific numbers and credibility. Max 60 characters.",
    // CTA
    cta_primary: "Generate 3 primary CTA options. Use formula: [Action Verb] + [What They Get]. Be specific, not generic.",
    cta_secondary: "Generate 3 secondary CTA options. Softer commitment, still valuable. 'Watch Demo', 'See How It Works'.",
    cta_urgency: "Generate 3 urgency CTA options. Create time-sensitive motivation. Use specific deadlines, scarcity, or immediate outcomes.",
    cta_objection_handling: "Generate 3 objection-handling CTA options. Address hesitations like 'Is this right for me?' or 'Cancel anytime'.",
    // PAGE COPY
    hero_section: "Generate hero section copy: headline (8 words max), subheadline (16 words max), and primary CTA text. Follow the structure.",
    landing_page: "Generate full landing page copy with these sections: Hero, Problem, Solution/Benefits (3), How It Works (3 steps), Testimonial, Final CTA. Complete narrative, not just headers.",
    about_story: "Generate an about/origin story. Start with why you exist, connect mission to customer benefit, end with CTA. Emotional but authentic.",
    pricing_value: "Generate pricing page value proposition copy. Help visitors choose the right plan. Address 'which is right for me?' anxiety.",
    feature_benefit: "For each feature provided, generate: Feature name, Benefit (what it means), Outcome (end result). Apply 'The So What Test'.",
    testimonial_intro: "Generate testimonial format options. Include: quote, name, role, company, specific results. Make it believable and impactful.",
    // EMAIL & ADS
    email_subject: "Generate 5 email subject line options. Mix of curious, direct, and social proof approaches. Consider mobile preview (first 40 chars critical).",
    email_body: "Generate a full email body. Include: hook (first line), body (benefits + proof), clear CTA. Write for scanning, mobile-first.",
    ad_facebook: "Generate Facebook/Instagram ad copy. Hook (first line stops scroll), body (build desire), CTA. Mobile-first, curiosity gaps.",
    ad_google: "Generate Google Ads copy: 3 headlines (30 chars each) + 2 descriptions (90 chars each). Include keywords, highlight unique value.",
    ad_linkedin: "Generate LinkedIn ad copy. Professional tone, B2B focus (ROI, efficiency), credibility signals. Hook + body + CTA.",
    // PRODUCT
    product_description: "Generate compelling product description. Lead with benefit, support with features, add proof, include CTA. Format: paragraph + bullets.",
    product_benefits: "Generate 5-7 benefit statements. Each should pass 'The So What Test' — answer why customer should care.",
    use_case_narrative: "Generate a use case narrative. Structure: Situation → Discovery → Experience → Result. Specific metrics over vague praise.",
    ad_direction: "Generate 2-3 ad direction suggestions. Each should include: name, strategy, target audience, creative direction, main selling point, recommended platform, adset count, and budget allocation."
  };

  return `${sections.join("\n")}

Task: ${typeInstructions[type] || `Generate ${meta.name} copy`}

Remember: Return valid JSON with "primary", "variants", and "reasoning" fields.`;
}
