# SPEC-PMI-REFACTOR: Product Marketing Intelligence Modular Refactor

## Overview
Refactor the 1304-line `page.tsx` into a modular architecture with industry-specific templates, reusable step components, and Agent AI integration via MiniMax.

## Architecture

```
src/
├── app/dashboard/product-marketing/
│   ├── page.tsx                    # Refactored main page with ModeSelector, ModuleCards, IndustryToggle
│   ├── types/
│   │   └── product-marketing.ts    # All shared types
│   ├── templates/
│   │   ├── ecommerce.ts            # E-commerce product template
│   │   └── restaurant.ts            # Restaurant/food product template
│   ├── components/
│   │   ├── steps/
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── Step1_URLInput.tsx
│   │   │   ├── Step2_Analysis.tsx
│   │   │   ├── Step3_SellingPoints.tsx
│   │   │   ├── Step4_Optimization.tsx
│   │   │   ├── Step5_CampaignStructure.tsx
│   │   │   ├── Step6_CreativeContent.tsx
│   │   │   └── Step7_PerformanceUpload.tsx
│   │   ├── ModeSelector.tsx        # Wizard vs Quick Mode toggle
│   │   ├── ModuleCards.tsx          # 3-module card selector
│   │   └── IndustryToggle.tsx      # Ecommerce/Restaurant toggle
│   └── skills/
│       ├── product-analysis.ts     # Agent Skill: product analysis
│       ├── ad-direction.ts         # Agent Skill: ad direction generation
│       └── creative-content.ts      # Agent Skill: creative copy generation
└── app/api/
    ├── product-analysis/
    │   └── route.ts                 # POST: AI product analysis
    ├── ad-direction/
    │   └── route.ts                 # POST: AI ad direction generation
    └── creative-content/
        └── route.ts                 # POST: AI creative content generation
```

## Types (types/product-marketing.ts)

```typescript
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Industry = 'ecommerce' | 'restaurant';
type Mode = 'wizard' | 'quick';
type Module = 'analysis' | 'campaign' | 'performance';

interface SellingPoint { id: string; point: string; category: Category; confirmed: boolean; }
type Category = 'feature' | 'benefit' | 'emotional' | 'social';
interface AdDirection { id: string; name: string; strategy: string; audienceDesc: string; creativeDirection: string; mainSellingPoint: string; platform: Platform; adsetCount: number; estimatedBudget: string; }
type Platform = 'facebook' | 'instagram' | 'both';
interface ProductInfo { name: string; price?: string; description?: string; features?: { name: string; category: string }[]; analysis?: ProductAnalysis; }
interface ProductAnalysis { targetAudience?: string; emotionalDrivers?: string[]; useCases?: string[]; }
interface AdSetData { id: string; name: string; audienceDesc: string; budgetPercent: number; ads: AdData[]; }
interface AdData { id: string; name: string; assetName: string; assetType: AssetType; headline?: string; primaryText?: string; cta?: string; }
type AssetType = 'image' | 'video' | 'carousel';
interface CampaignData { name: string; objective: string; platform: string; totalBudget: number; adSets: AdSetData[]; }
interface AnalysisResult { success?: boolean; rowsImported?: number; summary: Summary; topAdSets: AdSetRanking[]; topAssets: AssetRanking[]; insights: Insight[]; recommendations: Recommendation[]; }
interface Summary { totalSpend: number; totalConversions: number; avgROAS: number; totalAdSets?: number; totalAssets?: number; }
interface AdSetRanking { name: string; spend: number; conversions: number; roas: number; }
interface AssetRanking { name: string; ctr: number; conversions: number; spend: number; }
interface Insight { type: string; content: string; confidence: number; }
interface Recommendation { type: string; content: string; priority: string; }
interface IndustryTemplate { name: string; icon: string; mockProduct: ProductInfo; sellingPoints: SellingPoint[]; }
```

## Templates

### ecommerce.ts
- Default: Premium Wireless Earbuds Pro at $129
- Features: 30-hour battery, ANC, BT 5.3, IPX5, Hi-Res Audio, wireless charging
- Target audience: Young professionals 25-40
- Use cases: Commute, sports, work, travel
- Emotional drivers: 自信, 品味, 便捷

### restaurant.ts
- Restaurant-specific: signature dish promotion
- Features: signature dish, ambiance, service, ingredients
- Target audience: Food lovers, families, tourists
- Use cases: dine-in, takeaway, events

## Step Components

| Component | Responsibility |
|-----------|---------------|
| StepIndicator | Progress bar with 7 steps |
| Step1_URLInput | URL input with AI analysis trigger |
| Step2_Analysis | FAB/AIDA analysis display |
| Step3_SellingPoints | Benefit laddering with confirm toggle |
| Step4_Optimization | Multi-select optimization options |
| Step5_CampaignStructure | Ad direction generation + campaign builder |
| Step6_CreativeContent | Per-ad copy + script generation |
| Step7_PerformanceUpload | CSV/Excel upload + analysis results |

## Agent Skills (MiniMax AI)

### product-analysis.ts
- Input: product URL, name, description
- Output: FAB analysis, AIDA target audience, emotional drivers, use cases
- Model: abab6-chat, base: https://api.minimax.chat/v1

### ad-direction.ts
- Input: product info, selling points, target audience, platform, objective
- Output: array of AdDirection objects
- Calls /api/ad-direction route

### creative-content.ts
- Input: ad info, selling points, platform
- Output: headline, primary text, CTA, video script
- Calls /api/creative-content route

## API Routes

### POST /api/product-analysis
```typescript
Request: { url: string; name?: string; }
Response: { success: boolean; product: ProductInfo; }
```

### POST /api/ad-direction
```typescript
Request: { productName, productDescription, features, sellingPoints, targetAudience, platform, objective }
Response: { success: boolean; directions: AdDirection[]; error?: string }
```

### POST /api/creative-content
```typescript
Request: { adName; platform; sellingPoints; productInfo }
Response: { success: boolean; content: { headline; primaryText; cta; script? } }
```

## Refactored page.tsx

The page.tsx will:
1. Use `ModeSelector` to toggle between wizard (7 steps) and quick (direct to module) modes
2. Use `ModuleCards` to select from 3 modules: Analysis, Campaign, Performance
3. Use `IndustryToggle` to switch between ecommerce/restaurant templates
4. Import and render step components from `components/steps/`
5. Import templates from `templates/`

## Build & Deploy
- Build: `npm run build`
- Deploy to Vercel via `vercel deploy`
