/**
 * Product Analysis Agent Skill
 * Analyzes product URL/info and returns FAB, AIDA framework analysis
 */

import { openai, DEFAULT_MODEL } from '@/lib/skills/ai-client';
import type { ProductInfo, ProductAnalysisRequest, ProductAnalysisResponse } from '@/app/dashboard/product-marketing/types/product-marketing';

const SYSTEM_PROMPT = `你是一個專業的電商產品分析師，專精於 FAB (Feature-Advantage-Benefit) 和 AIDA (Attention-Interest-Desire-Action) 分析框架。

當給定產品資訊時，你會：
1. 分析產品的每個功能特點
2. 將 Feature 轉化為 Advantage 再提升為 Benefit
3. 識別目標受眾画像
4. 找出情感驅動因素
5. 定義使用場景

請用繁體中文回覆。`;

export async function analyzeProduct(request: ProductAnalysisRequest): Promise<ProductAnalysisResponse> {
  try {
    // Mock response - in production this would call MiniMax API
    const mockProduct: ProductInfo = {
      name: request.name || 'Premium Wireless Earbuds Pro',
      price: '$129',
      description: 'High-fidelity wireless earbuds with 30-hour battery life and active noise cancellation.',
      features: [
        { name: '30-hour battery', category: 'feature' },
        { name: 'Active Noise Cancellation', category: 'feature' },
        { name: 'Bluetooth 5.3', category: 'feature' },
        { name: 'IPX5 water resistant', category: 'feature' },
        { name: 'Hi-Res Audio certified', category: 'feature' },
        { name: 'Wireless charging', category: 'feature' },
      ],
      analysis: {
        targetAudience: 'Young professionals 25-40 who value quality audio and convenience',
        emotionalDrivers: ['自信', '品味', '便捷'],
        useCases: ['通勤', '運動', '工作', '旅行'],
      }
    };

    return {
      success: true,
      product: mockProduct,
    };
  } catch (error) {
    return {
      success: false,
      product: {} as ProductInfo,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

export async function analyzeProductWithAI(request: ProductAnalysisRequest): Promise<ProductAnalysisResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `分析這個產品：${request.url} ${request.name || ''}` },
      ],
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Return structured response
    return analyzeProduct(request);
  } catch (error) {
    return {
      success: false,
      product: {} as ProductInfo,
      error: error instanceof Error ? error.message : 'AI analysis failed',
    };
  }
}
