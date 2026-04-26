// ============ CORE TYPES ============

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Industry = 'ecommerce' | 'restaurant';

export type Mode = 'wizard' | 'quick';

export type Module = 'analysis' | 'campaign' | 'performance';

export type Category = 'feature' | 'benefit' | 'emotional' | 'social';

export type Platform = 'facebook' | 'instagram' | 'both';

export type AssetType = 'image' | 'video' | 'carousel';

// ============ SELLING POINT ============

export interface SellingPoint {
  id: string;
  point: string;
  category: Category;
  confirmed: boolean;
}

// ============ AD DIRECTION ============

export interface AdDirection {
  id: string;
  name: string;
  strategy: string;
  audienceDesc: string;
  creativeDirection: string;
  mainSellingPoint: string;
  platform: Platform;
  adsetCount: number;
  estimatedBudget: string;
}

// ============ PRODUCT INFO ============

export interface ProductFeature {
  name: string;
  category: string;
}

export interface ProductAnalysis {
  targetAudience?: string;
  emotionalDrivers?: string[];
  useCases?: string[];
}

export interface ProductInfo {
  name: string;
  price?: string;
  description?: string;
  platform?: string;
  url?: string;
  features?: ProductFeature[];
  analysis?: ProductAnalysis;
}

// ============ CAMPAIGN DATA ============

export interface AdData {
  id: string;
  name: string;
  assetName: string;
  assetType: AssetType;
  headline?: string;
  primaryText?: string;
  cta?: string;
}

export interface AdSetData {
  id: string;
  name: string;
  audienceDesc: string;
  budgetPercent: number;
  ads: AdData[];
}

export interface CampaignData {
  name: string;
  objective: string;
  platform: string;
  totalBudget: number;
  adSets: AdSetData[];
}

// ============ ANALYSIS RESULT ============

export interface AdSetRanking {
  name: string;
  spend: number;
  conversions: number;
  roas: number;
}

export interface AssetRanking {
  name: string;
  ctr: number;
  conversions: number;
  spend: number;
}

export interface Insight {
  type: string;
  content: string;
  confidence: number;
}

export interface Recommendation {
  type: string;
  content: string;
  priority: string;
}

export interface Summary {
  totalSpend: number;
  totalConversions: number;
  avgROAS: number;
  totalAdSets?: number;
  totalAssets?: number;
}

export interface AnalysisResult {
  success?: boolean;
  rowsImported?: number;
  summary: Summary;
  topAdSets: AdSetRanking[];
  topAssets: AssetRanking[];
  insights: Insight[];
  recommendations: Recommendation[];
}

// ============ INDUSTRY TEMPLATE ============

export interface IndustryTemplate {
  name: string;
  icon: string;
  mockProduct: ProductInfo;
  sellingPoints: SellingPoint[];
}

// ============ API REQUEST/RESPONSE ============

export interface ProductAnalysisRequest {
  url: string;
  name?: string;
}

export interface ProductAnalysisResponse {
  success: boolean;
  product: ProductInfo;
  error?: string;
}

export interface AdDirectionRequest {
  productName: string;
  productDescription: string;
  features: ProductFeature[];
  sellingPoints: SellingPoint[];
  targetAudience: string;
  platform: Platform;
  objective: string;
}

export interface AdDirectionResponse {
  success: boolean;
  directions: AdDirection[];
  error?: string;
}

export interface CreativeContentRequest {
  adName: string;
  platform: Platform;
  sellingPoints: SellingPoint[];
  productInfo: ProductInfo;
}

export interface CreativeContentResponse {
  success: boolean;
  content: {
    headline?: string;
    primaryText?: string;
    cta?: string;
    script?: string;
  };
  error?: string;
}
