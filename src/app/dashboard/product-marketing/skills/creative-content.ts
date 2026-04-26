/**
 * Creative Content Agent Skill
 * Generates ad copy, headlines, CTAs, and video scripts
 */

import { openai, DEFAULT_MODEL } from '@/lib/skills/ai-client';
import type { CreativeContentRequest, CreativeContentResponse } from '@/app/dashboard/product-marketing/types/product-marketing';

const SYSTEM_PROMPT = `你是一個專業的 Facebook/Instagram 廣告文案創意師。

根據廣告資訊和產品賣點，生成：
- headline: 吸引眼球的標題 (最多8個字)
- primaryText: 主要內文 (2-3句話，引起興趣和欲望)
- cta: 行動呼籲按鈕文字
- script: 視頻腳本 (如果是 video 類型)，30秒版本

請用繁體中文，語氣自然有說服力，符合香港口語風格。`;

export async function generateCreativeContent(request: CreativeContentRequest): Promise<CreativeContentResponse> {
  try {
    // Mock response based on selling points
    const headline = request.sellingPoints[0]?.point.split('—')[0] || '30小時續航，音樂不停歇';
    const primaryText = `告別電量焦慮！${request.productInfo.name} 讓你一整天專注做事。\n\n${request.sellingPoints.filter(p => p.confirmed).slice(0, 2).map(p => p.point).join('。')}`;
    const cta = '立即選購';
    const script = `（0-3秒）你有沒有想過，為什麼有些人總是能專注工作？

（3-15秒）這就是為什麼我們設計了 ${request.productInfo.name}。${request.sellingPoints[0]?.point || '30小時續航'}。

（15-30秒）點擊下方連結，今天就改變你的聽覺體驗！`;

    return {
      success: true,
      content: {
        headline,
        primaryText,
        cta,
        script: request.platform === 'instagram' ? script : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      content: {},
      error: error instanceof Error ? error.message : 'Content generation failed',
    };
  }
}

export async function generateCreativeContentWithAI(request: CreativeContentRequest): Promise<CreativeContentResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(request, null, 2) },
      ],
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Return structured response
    return generateCreativeContent(request);
  } catch (error) {
    return {
      success: false,
      content: {},
      error: error instanceof Error ? error.message : 'AI content generation failed',
    };
  }
}
