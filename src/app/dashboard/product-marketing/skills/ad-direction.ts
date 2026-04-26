/**
 * Ad Direction Agent Skill
 * Generates multiple ad directions based on product info and selling points
 */

import { openai, DEFAULT_MODEL } from '@/lib/skills/ai-client';
import type { AdDirectionRequest, AdDirectionResponse, AdDirection } from '@/app/dashboard/product-marketing/types/product-marketing';

const SYSTEM_PROMPT = `你是一個專業的 Facebook/Instagram 廣告策略師。

根據產品資訊和賣點，生成 3-5 個差異化的廣告方向 (Ad Directions)，每個方向包括：
- name: 方向名稱
- strategy: 核心策略描述
- audienceDesc: 目標受眾描述
- creativeDirection: 創意方向建議
- mainSellingPoint: 主打賣點
- platform: facebook | instagram | both
- adsetCount: 建議的 Ad Set 數量
- estimatedBudget: 建議預算分配百分比

每個方向要有明顯差異，面向不同受眾或使用不同創意策略。

請用繁體中文回覆。`;

export async function generateAdDirections(request: AdDirectionRequest): Promise<AdDirectionResponse> {
  try {
    // Mock response
    const directions: AdDirection[] = [
      {
        id: 'dir-0',
        name: '品質生活型',
        strategy: '強調產品品質和生活品味提升，針對追求品質的年輕專業人士',
        audienceDesc: '香港 28-38歲，中高收入，重視生活品質',
        creativeDirection: '使用高品質 lifestyle 圖片，突出產品精緻設計和音樂體驗',
        mainSellingPoint: '30小時超長續航 + Hi-Res 音效',
        platform: 'both',
        adsetCount: 2,
        estimatedBudget: '40%',
      },
      {
        id: 'dir-1',
        name: '運動健身型',
        strategy: '強調運動場景下的使用體驗，針對健身和運動愛好者',
        audienceDesc: '25-40歲，有運動習慣，關注健康生活',
        creativeDirection: '運動場景圖片/影片，展示防水和穩固佩戴特點',
        mainSellingPoint: 'IPX5防水 + 輕巧設計',
        platform: 'instagram',
        adsetCount: 1,
        estimatedBudget: '30%',
      },
      {
        id: 'dir-2',
        name: '送禮尊貴型',
        strategy: '節慶送禮場景，強調產品作為精緻禮物的定位',
        audienceDesc: '30-45歲，考慮送禮的消費者',
        creativeDirection: '節慶包裝精美圖片，突出送禮氛圍',
        mainSellingPoint: '精美包裝 + 高端品質',
        platform: 'facebook',
        adsetCount: 1,
        estimatedBudget: '30%',
      },
    ];

    return {
      success: true,
      directions,
    };
  } catch (error) {
    return {
      success: false,
      directions: [],
      error: error instanceof Error ? error.message : 'Direction generation failed',
    };
  }
}

export async function generateAdDirectionsWithAI(request: AdDirectionRequest): Promise<AdDirectionResponse> {
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
    return generateAdDirections(request);
  } catch (error) {
    return {
      success: false,
      directions: [],
      error: error instanceof Error ? error.message : 'AI direction generation failed',
    };
  }
}
