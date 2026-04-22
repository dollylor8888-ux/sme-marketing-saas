/**
 * AI SEO Skill — Optimize content for AI search engines
 * User-facing: content optimization, meta tags, schema markup
 */

import { openai, DEFAULT_MODEL } from "../ai-client";
import { calculateApiCost, TokenRecord } from "../../billing/token-tracker";
import { calculateActionMargin, MarginRecord } from "../../billing/margin-calculator";
import { SkillCreditCost } from "../../billing/models";

export type SeoTask = "optimize_content" | "meta_tags" | "schema_markup" | "keyword_research" | "content_audit";

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
  error?: string;
}

export async function optimizeForSeo(input: SeoInput): Promise<{
  output: SeoOutput;
  tokenRecord?: TokenRecord;
  marginRecord?: MarginRecord;
}> {
  const { task, content, title, targetKeyword, url, language = "English" } = input;

  // MOCK MODE
  if (true) {
    return {
      output: {
        success: true,
        result: `[MOCK SEO ${task}] Optimized for keyword: ${targetKeyword || "general"}`,
        suggestions: ["Add more headers", "Use bullet points", "Include meta description"],
      },
    };
  }

  const systemPrompt = "You are an SEO expert specializing in AI search engine optimization. Provide actionable recommendations.";
  const userPrompt = buildUserPrompt(task, { content, title, targetKeyword, url, language });

  try {
    const estimatedInputTokens = Math.ceil((systemPrompt + userPrompt).length / 4);

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 800,
    });

    const outputText = completion.choices[0]?.message?.content ?? "";
    const usage = completion.usage;

    const inputTokens = usage?.prompt_tokens ?? estimatedInputTokens;
    const outputTokens = usage?.completion_tokens ?? Math.ceil(outputText.length / 4);

    const tokenRecord: TokenRecord = {
      userId: "pending",
      skill: "ai-seo",
      actionType: task,
      model: DEFAULT_MODEL,
      inputTokens,
      outputTokens,
      userPaidCredits: SkillCreditCost["ai-seo"],
    };

    const marginRecord = calculateActionMargin(tokenRecord);

    return {
      output: { success: true, result: outputText },
      tokenRecord,
      marginRecord,
    };
  } catch (e) {
    return {
      output: { success: false, error: (e as Error).message || String(e) },
    };
  }
}

function buildUserPrompt(
  task: SeoTask,
  opts: { content?: string; title?: string; targetKeyword?: string; url?: string; language?: string }
): string {
  const { content, title, targetKeyword, url, language } = opts;

  const tasks: Record<SeoTask, string> = {
    optimize_content: `Optimize the following content for AI search engines.\nTitle: ${title ?? "N/A"}\nContent: ${content ?? ""}\nTarget keyword: ${targetKeyword ?? "N/A"}\nLanguage: ${language}\n\nProvide:\n1. Improved content with SEO enhancements\n2. Secondary keywords to include\n3. Content structure recommendations`,

    meta_tags: `Generate SEO meta tags for:\nURL: ${url ?? "N/A"}\nTitle: ${title ?? "N/A"}\nTarget keyword: ${targetKeyword ?? "N/A"}\nLanguage: ${language}\n\nProvide:\n1. Meta title (50-60 chars)\n2. Meta description (150-160 chars)\n3. Open Graph tags`,

    schema_markup: `Generate JSON-LD schema markup for:\nURL: ${url ?? "N/A"}\nTitle: ${title ?? "N/A"}\nType: article/product/organization (infer from context)\nLanguage: ${language}`,

    keyword_research: `Research keywords for:\nTopic: ${title ?? "N/A"}\nLanguage: ${language}\n\nProvide:\n1. Primary keyword\n2. 10 related long-tail keywords\n3. Search intent analysis`,

    content_audit: `Audit the following content for SEO:\nContent: ${content ?? ""}\nTitle: ${title ?? "N/A"}\nURL: ${url ?? "N/A"}\nTarget keyword: ${targetKeyword ?? "N/A"}\n\nProvide:\n1. SEO score (0-100)\n2. Strengths\n3. Issues to fix\n4. Actionable recommendations`,
  };

  return tasks[task] ?? "Perform SEO analysis.";
}
