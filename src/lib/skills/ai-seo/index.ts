/**
 * AI SEO Skill — Optimize content for AI search engines
 * User-facing: content optimization, meta tags, schema markup
 * 
 * Features:
 * - Memory-enhanced prompts
 * - Structured output
 * - Best practices for AI-first indexing
 */

import { openai, DEFAULT_MODEL } from "../ai-client";
import { TokenRecord } from "../../billing/token-tracker";
import { calculateActionMargin, MarginRecord } from "../../billing/margin-calculator";
import { SkillCreditCost } from "../../billing/models";
import { buildMemoryContext } from "../../memory/memory-service";

export type SeoTask = 
  | "optimize_content" 
  | "meta_tags" 
  | "schema_markup" 
  | "keyword_research" 
  | "content_audit";

export interface SeoInput {
  task: SeoTask;
  content?: string;
  title?: string;
  targetKeyword?: string;
  url?: string;
  language?: string;
}

export interface SeoOutput {
  success: boolean;
  result?: string;
  suggestions?: string[];
  structured?: Record<string, unknown>;
  error?: string;
}

// ============ SYSTEM PROMPTS ============

function buildSystemPrompt(task: SeoTask, memoryContext: string): string {
  const base = getBasePrompt(task);
  
  return `${base}

${memoryContext ? `## USER CONTEXT
${memoryContext}
---` : ""}

## OUTPUT FORMAT
Return JSON with:
{
  "result": "your main recommendation/analysis",
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "reasoning": "brief explanation"
}`;
}

function getBasePrompt(task: SeoTask): string {
  const prompts: Record<SeoTask, string> = {
    optimize_content: `You are an SEO expert specializing in content optimization for AI search engines (like Perplexity, Claude Search, Bing Copilot).

Your job: Optimize existing content to rank well in AI-powered search results.

AI search ranking factors you care about:
1. CLEAR STRUCTURE — H1/H2/H3 hierarchy, bullet points, numbered lists
2. ENTITY CLARITY — Clear subject-verb-object, define terms early
3. CITABILITY — Facts with sources, dates, specific numbers
4. COMPLETENESS — Answer the full question, not just surface level
5. FRESHNESS — Include publication/update dates

Content optimization techniques:
- Add a clear, descriptive intro (1-2 sentences)
- Use subheadings that are questions or statements
- Include a TL;DR or key takeaways section
- Add bullet points for scannability
- End with a clear conclusion or next steps`,

    meta_tags: `You are an SEO expert creating meta tags optimized for AI search engines and traditional search.

Meta title rules (50-60 chars):
- Front-load important keywords
- Include brand name at end (if space allows)
- Make it compelling enough to click
- Avoid truncation in SERPs

Meta description rules (150-160 chars):
- Summarize page content accurately
- Include primary and secondary keywords naturally
- Create urgency or curiosity without clickbait
- Include a subtle call-to-action if organic

OG tags for social:
- og:title should mirror meta title (or be social-specific)
- og:description should complement, not duplicate meta`,

    schema_markup: `You are a technical SEO expert specializing in structured data and Schema.org markup.

Your job: Generate Schema.org JSON-LD markup for pages.

Key schemas to use:
- Organization (for brand pages)
- Product (for product pages)
- Article/BlogPosting (for blog posts)
- FAQPage (for Q&A pages)
- HowTo (for tutorial pages)
- LocalBusiness (for location-based businesses)

Schema best practices:
- Use most specific schema type possible
- Include all required properties
- Add recommended properties for richer results
- Avoid duplicate markup (don't mark same content twice)
- Test with Google's Rich Results Test after implementation`,

    keyword_research: `You are an SEO keyword research expert.

Your job: Help find strategic keywords for content optimization.

Research approach:
1. PRIMARY KEYWORD — The main topic (1-2 words)
2. LONG-TAIL VARIANTS — Questions, modifiers (5+ words)
3. SEMANTIC RELATED — Words AI might associate with topic
4. COMPETITOR TERMS — What similar pages rank for

Keyword analysis framework:
- Search intent: informational, navigational, transactional, commercial
- Difficulty estimate: based on top results
- Content angle: how to approach the topic differently
- Content gaps: what existing results miss`,

    content_audit: `You are an SEO content auditor analyzing existing content.

Your job: Evaluate content against SEO best practices and provide actionable improvements.

Audit checklist:
1. TITLE TAG — Keyword placement, length, compelling?
2. META DESCRIPTION — Call to action, keyword included?
3. CONTENT STRUCTURE — Headers, paragraphs, lists, quotes?
4. CONTENT QUALITY — Depth, uniqueness, accuracy, recency?
5. KEYWORD USAGE — Title, headers, first 100 words, throughout?
6. INTERNAL LINKS — Links to related content?
7. EXTERNAL LINKS — Credible sources cited?
8. MEDIA — Images with alt text, video?
9. READABILITY — Grade level, sentence length, jargon?

Provide scores (1-10) and specific improvement suggestions.`,
  };

  return prompts[task] ?? "You are an SEO expert. Analyze and optimize content for search.";
}

// ============ MAIN FUNCTION ============

export async function optimizeForSeo(
  input: SeoInput,
  userId?: string
): Promise<{
  output: SeoOutput;
  tokenRecord?: TokenRecord;
  marginRecord?: MarginRecord;
}> {
  const { task: rawTask, content, title, targetKeyword, url, language = "English" } = input;
  const task: SeoTask = rawTask;

  // MOCK MODE
  if (true) {
    return {
      output: {
        success: true,
        result: `[MOCK SEO ${task}] Optimized for keyword: ${targetKeyword || "general"}`,
        suggestions: [
          "Add more headers (H2/H3)",
          "Use bullet points for scannability",
          "Include meta description",
          "Add internal links",
          "Include a clear conclusion",
        ],
      },
    };
  }

  try {
    // Build memory context if userId provided
    const theUserId = userId ?? "";
    const memoryContext = theUserId
      ? await buildMemoryContext(theUserId, "ai-seo", "general")
      : "";

    const systemPrompt = buildSystemPrompt(task, memoryContext);
    const userPrompt = buildUserPrompt(task, { content, title, targetKeyword, url, language });

    const estimatedInputTokens = Math.ceil((systemPrompt + userPrompt).length / 4);

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const outputText = completion.choices[0]?.message?.content ?? "";
    const usage = completion.usage;

    const inputTokens = usage?.prompt_tokens ?? estimatedInputTokens;
    const outputTokens = usage?.completion_tokens ?? Math.ceil(outputText.length / 4);

    // Parse JSON output
    let parsed: { result?: string; suggestions?: string[]; reasoning?: string } = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      parsed = { result: outputText };
    }

    const tokenRecord: TokenRecord = {
      userId: userId ?? "unknown",
      skill: "ai-seo",
      actionType: task,
      model: DEFAULT_MODEL,
      inputTokens,
      outputTokens,
      userPaidCredits: SkillCreditCost["ai-seo"],
    };

    const marginRecord = calculateActionMargin(tokenRecord);

    return {
      output: {
        success: true,
        result: parsed.result ?? outputText,
        suggestions: parsed.suggestions ?? [],
        structured: parsed as Record<string, unknown>,
      },
      tokenRecord,
      marginRecord,
    };
  } catch (e) {
    return {
      output: {
        success: false,
        error: (e as Error).message || String(e),
      },
    };
  }
}

// ============ USER PROMPT BUILDER ============

function buildUserPrompt(
  task: SeoTask,
  opts: {
    content?: string;
    title?: string;
    targetKeyword?: string;
    url?: string;
    language?: string;
  }
): string {
  const { content, title, targetKeyword, url, language } = opts;

  const sections: string[] = [];
  
  if (task === "meta_tags" && title) {
    sections.push(`Page Title: ${title}`);
  }
  
  if (task === "optimize_content" && content) {
    sections.push(`Content to optimize:\n${content.substring(0, 2000)}`);
  }
  
  if (task === "content_audit" && content) {
    sections.push(`Content to audit:\n${content.substring(0, 2000)}`);
  }
  
  if (targetKeyword) sections.push(`Target Keyword: ${targetKeyword}`);
  if (url) sections.push(`Page URL: ${url}`);
  sections.push(`Language: ${language}`);

  const instructions: Record<SeoTask, string> = {
    optimize_content: "Provide specific, actionable suggestions to optimize this content for AI search engines. Focus on structure, clarity, and citability.",
    meta_tags: "Generate optimized meta title, meta description, and OG tags for this page.",
    schema_markup: "Generate Schema.org JSON-LD markup for this page. Include the most specific schema type that applies.",
    keyword_research: "Provide keyword research: primary keyword, long-tail variants, related terms, and content angle suggestions.",
    content_audit: "Audit this content against SEO best practices. Provide scores and specific improvements for each area.",
  };

  return `${sections.join("\n\n")}

Task: ${instructions[task]}

Return valid JSON with "result", "suggestions", and "reasoning" fields.`;
}
