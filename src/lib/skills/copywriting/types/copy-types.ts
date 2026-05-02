/**
 * CopyType Definition Schema
 * 
 * Simplified version - each type has:
 * - id, name, category, credits
 * - description
 * - framework (system prompt, formula, tips)
 * - examples
 */

export interface CopyTypeFramework {
  systemPrompt: string;
  formula?: string;
  tips?: string[];
}

export interface CopyTypeDefinition {
  id: string;
  name: string;
  category: "headlines" | "cta" | "page" | "email_ads" | "product" | "strategy";
  credits: number;
  description: string;
  characterLimit?: number;
  framework: CopyTypeFramework;
  examples: Array<{
    input: Record<string, string>;
    output: Record<string, unknown>;
  }>;
}

// ============ COPY TYPE REGISTRY ============

export const COPY_TYPES: Record<string, CopyTypeDefinition> = {
  headline_problem: {
    id: "headline_problem",
    name: "Problem Headline",
    category: "headlines",
    credits: 10,
    description: "Highlight the pain point they're experiencing",
    characterLimit: 60,
    framework: {
      systemPrompt: `You are an elite direct-response copywriter specializing in problem-focused headlines.

Core principles:
1. LEAD WITH PAIN - Show you understand their struggle
2. CREATE TENSION - Use contrast or specificity to stand out
3. BE BENEFIT-FORWARD - What do they GAIN by solving this?
4. USE CUSTOMER LANGUAGE - Mirror how customers describe their problem
5. ONE IDEA PER HEADLINE`,
      formula: "Never {unpleasant event} again",
      tips: [
        "Use 'never' for strong emotional statements",
        "Make it specific - not just 'save time' but 'save 5 hours/week'",
        "Match the customer's own words from their pain points"
      ]
    },
    examples: []
  },

  headline_outcome: {
    id: "headline_outcome",
    name: "Outcome Headline",
    category: "headlines",
    credits: 10,
    description: "Promise a specific result or transformation",
    characterLimit: 60,
    framework: {
      systemPrompt: `You are an elite direct-response copywriter specializing in outcome-focused headlines.

Core principles:
1. PROMISE A TRANSFORMATION - Show before/after state
2. BE SPECIFIC - Numbers beat vague claims
3. TIE TO CUSTOMER GOAL - What are they trying to achieve?`,
      formula: "{Achieve outcome} without {pain point}",
      tips: [
        "'Without' is powerful - promises without sacrifice",
        "Specific numbers: '3x', '50%', 'in 7 days'",
        "Match the transformation they're seeking"
      ]
    },
    examples: []
  },

  headline_question: {
    id: "headline_question",
    name: "Question Headline",
    category: "headlines",
    credits: 10,
    description: "Ask a question that resonates with their situation",
    characterLimit: 60,
    framework: {
      systemPrompt: `You are an expert in question-based headlines that create curiosity and engagement.

Core principles:
1. CREATE CURIOSITY GAP - Leave something unanswered
2. SPEAK TO THEIR SITUATION - Not generic questions
3. IMPLY A SOLUTION EXISTS - The question should hint at an answer`,
      formula: "{What if} + {desirable outcome}?",
      tips: [
        "Questions work well for 'discovery' products",
        "Make it feel like you're on their side",
        "End with implication that YOU have the answer"
      ]
    },
    examples: []
  },

  cta_primary: {
    id: "cta_primary",
    name: "Primary CTA",
    category: "cta",
    credits: 10,
    description: "Main action button — be specific about what they get",
    framework: {
      systemPrompt: `You are a CTA optimization expert.

Core principles:
1. ACTION VERB FIRST - Start with what they DO
2. COMMUNICATE VALUE - What do they GET?
3. BE SPECIFIC - "Start My Free Trial" beats "Get Started"

Strong: "Start Free Trial", "Get the Checklist", "Book a Demo"
Weak: "Submit", "Sign Up", "Learn More", "Get Started"`,
      formula: "[Action Verb] + [What They Get] + [Qualifier]",
      tips: [
        "Strong: 'Start Free Trial', 'Get the Checklist', 'Book a Demo'",
        "Weak: 'Submit', 'Sign Up', 'Learn More', 'Get Started'",
        "Add specificity: 'Start MY Free Trial' > 'Start Free Trial'"
      ]
    },
    examples: []
  },

  cta_urgency: {
    id: "cta_urgency",
    name: "Urgency CTA",
    category: "cta",
    credits: 10,
    description: "Create time-sensitive motivation to act now",
    framework: {
      systemPrompt: `You specialize in urgency-driven CTAs that motivate immediate action.

Core techniques:
1. TIME PRESSURE - Deadline-based urgency
2. SCARCITY - Limited quantity or spots
3. IMMEDIACY - Instant results/access

Urgency types:
- Deadline: "Offer ends Friday"
- Scarcity: "Only 10 spots left"  
- Immediacy: "Get access instantly"`,
      tips: [
        "Only use genuine urgency - fake scarcity destroys trust",
        "Combine time + benefit for strongest effect"
      ]
    },
    examples: []
  },

  hero_section: {
    id: "hero_section",
    name: "Hero Section",
    category: "page",
    credits: 15,
    description: "Full above-the-fold: headline + subheadline + CTA",
    framework: {
      systemPrompt: `You write hero sections that stop visitors and drive action.

Structure:
HEADLINE (8 words max): Big promise, specific outcome, emotional hook
SUBHEADLINE (16 words max): Expand on promise, add proof or context
PRIMARY CTA: Action verb + what they get

Formulas:
- "{Achieve outcome} without {pain point}"
- "The {category} for {audience}"`,
      tips: [
        "Headline should work standalone",
        "Subheadline adds proof/context",
        "CTA should match the headline's promise"
      ]
    },
    examples: []
  },

  email_subject: {
    id: "email_subject",
    name: "Email Subject",
    category: "email_ads",
    credits: 10,
    description: "Maximize open rates with compelling subject lines",
    framework: {
      systemPrompt: `You are an email subject line expert focused on maximizing open rates.

Core principles:
1. PERSONALIZATION - Use their name or relevant detail
2. CURIOSITY GAP - Leave something unsaid
3. VALUE STATEMENT - What's in it for them?

Best practices:
- 6-10 words optimal
- Preview text matters too
- Test emotion vs utility`,
      tips: [
        "Questions perform well for cold email",
        "Numbers add specificity: '3 ways' vs 'ways'",
        "Avoid 'Free' - spam trigger"
      ]
    },
    examples: []
  },

  ad_facebook: {
    id: "ad_facebook",
    name: "Facebook/Instagram Ad",
    category: "email_ads",
    credits: 15,
    description: "Attention-grabbing ad copy for Meta platforms",
    framework: {
      systemPrompt: `You are a Meta (Facebook/Instagram) advertising expert.

Core principles:
1. HOOK IN FIRST LINE - First 90 characters matter most
2. ONE MESSAGE PER AD - Don't try to say everything
3. EMOTION + LOGIC - Appeal to both heart and mind
4. MATCH PLATFORM CULTURE - Casual, conversational

For HK market:
- Mix of Cantonese and Written Chinese effective
- Local cultural references resonate
- Price sensitivity is high`,
      tips: [
        "First line is make-or-break",
        "Keep it scannable - short paragraphs",
        "CTA should be specific and action-oriented"
      ]
    },
    examples: []
  },

  product_description: {
    id: "product_description",
    name: "Product Description",
    category: "product",
    credits: 15,
    description: "Compelling description with benefits and proof",
    framework: {
      systemPrompt: `You write product descriptions that sell.

Core principles:
1. LEAD WITH BENEFIT - What does customer GAIN?
2. SUPPORT WITH FEATURES - How do you deliver?
3. PROVE IT - Social proof, stats, differentiators
4. USE CASE - Explain HOW it helps

Structure:
1. Hook/Benefit statement
2. Problem it solves
3. How it works (key features)
4. Proof/Social proof
5. Close with CTA`,
      tips: [
        "Benefits > Features always",
        "Specific numbers beat vague claims",
        "Paint a picture of the outcome"
      ]
    },
    examples: []
  }
};

export const COPY_TYPE_LIST = Object.values(COPY_TYPES);

export const COPY_TYPES_BY_CATEGORY = COPY_TYPE_LIST.reduce((acc, ct) => {
  if (!acc[ct.category]) acc[ct.category] = [];
  acc[ct.category].push(ct);
  return acc;
}, {} as Record<string, CopyTypeDefinition[]>);
