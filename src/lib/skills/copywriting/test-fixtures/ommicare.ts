/**
 * OmmiCare Product Marketing Context Fixtures
 * 
 * Real product data for offline prompt preview and validator testing.
 */

import type { CopywritingModeInput } from "../types/modes";

/** ad_copy_set fixture — LumiClear 廣告文案測試 */
export const ommicareLumiClearAdCopySet: CopywritingModeInput = {
  mode: "ad_copy_set",
  product: "LumiClear 美白精華",
  brand: "OmmiCare",
  audience: "25-40歲香港女性，注重護膚，追求白皙透亮肌膚",
  benefits: "有效淡化色斑、痘印；均勻膚色；保濕鎖水",
  painPoint: "香港濕熱天氣令皮膚暗啞；色斑難以消退；市面上美白產品見效慢",
  offer: "母親節限定：買二送一；香港免費送貨",
  platform: "Facebook Feed",
  month: "5月",
  festival: "母親節",
  market: "香港",
  salesGoal: "母親節檔期 HK$50,000 銷售額",
  budgetLevel: "中等（HK$3,000-5,000/週）",
  tone: "溫暖、親切、值得信賴",
  language: "cantonese",
  productOverview: "LumiClear 美白精華液 — 適合香港氣候的美白護膚精華，主打快速見效",
  differentiators: "專為香港濕熱氣候設計；質地清爽不黏笠；4週看見明顯效果",
  customerLanguage: "「想美白但係驚黏幾」「香港天氣成日出油，唔敢用太潤嘅嘢」「試過好多美白都冇效」",
  wordsToUse: ["透亮", "白皙", "告別暗啞", "香港女性摰愛", "清爽"],
  wordsToAvoid: ["最有效", "終極", "奇蹟", "99%效果", "醫學級"],
  proofPoints: ["香港用家真人分享", "SGS 安全認證", "不含對苯二酚"],
  goals: "母親節檔期爆單；建立口碑回購",
  brandVoice: {
    name: "OmmiCare",
    tagline: "香港女性護膚信心之選",
    values: ["安全", "有效", "貼心"],
    voice: "專業但不失親和力，像朋友建議一樣",
    style: ["溫暖", "真誠", "實際"],
  },
};

/** campaign_direction fixture — Neck Warmer 推廣方向測試 */
export const ommicareNeckWarmerCampaignDirection: CopywritingModeInput = {
  mode: "campaign_direction",
  product: "OmmiCare 智能溫熱頸枕",
  brand: "OmmiCare",
  audience: "30-50歲香港在職人士，長時間對著電腦工作，肩頸疲勞",
  benefits: "智能溫熱舒緩肩頸；人體工學支撐；可機洗；輕巧便攜",
  painPoint: "辦公室冷氣太凍；肩頸僵硬酸痛；晚上訓唔好；旅行長時間坐飛機",
  offer: "新客9折；購物滿HK$300免運費",
  platform: "Facebook + Instagram",
  month: "11月",
  festival: "雙十一",
  market: "香港",
  salesGoal: "雙十一活動 HK$80,000 銷售額；吸納200個新客",
  budgetLevel: "高（HK$8,000-12,000/活動期）",
  tone: "關愛、健康、實用導向",
  language: "traditional_chinese",
  productOverview: "智能溫熱頸枕 — 為香港打工仔設計的肩頸舒緩產品，結合溫熱和人體工學",
  differentiators: "USB供電可重複使用；人體工學C型設計；3段溫度調控；可拆洗布套",
  customerLanguage: "成日對電腦，頸硬到斷；搭飛機成日訓唔著；冷氣間坐一日，成个人實晒",
  wordsToUse: ["打工仔恩物", "肩頸救星", "告別僵硬", "舒緩疲勞"],
  wordsToAvoid: ["治療", "醫療", "根治", "最舒服"],
  proofPoints: ["100+ 香港用家5星好評", "CE 認證", "物理治療師推薦"],
  goals: "雙十一爆單；建立「送禮首選」品牌形象",
  brandVoice: {
    name: "OmmiCare",
    tagline: "疼愛自己・由OmmiCare開始",
    values: ["舒適", "健康", "關愛"],
    voice: "了解香港打工仔的辛酸，提供實際幫助",
    style: ["窩心", "實際", "可信"],
  },
};

/** product_angle_explorer fixture — Eye Mask 產品角度挖掘測試 */
export const ommicareEyeMaskProductAngleExplorer: CopywritingModeInput = {
  mode: "product_angle_explorer",
  product: "OmmiCare 蒸汽眼罩",
  brand: "OmmiCare",
  audience: "20-35歲香港女性，愛美、注重睡眠品質、有旅行習慣",
  benefits: "40度恆溫蒸氣；舒緩眼部疲勞；幫助入睡；一次性使用方便衛生",
  painPoint: "眼乾眼澀；訓唔著；旅行時差；戴con眼睛乾",
  offer: "套裝優惠：買5送1",
  platform: "Instagram + 小紅書",
  market: "香港 + 澳門",
  tone: "放鬆、呵護、儀式感",
  language: "cantonese",
  productOverview: "OmmiCare 蒸汽眼罩 — 一次性發熱蒸氣眼罩，幫助舒緩眼部疲勞和改善睡眠",
  differentiators: "40度黃金溫度；無香料配方（適合敏感肌）；獨立包裝便攜；15分鐘持續發熱",
  customerLanguage: "訓到凌晨兩點都訓唔著；成日睇電話，眼乾到標眼水；飛機上dry到訓唔著",
  wordsToUse: ["眼部 SPA", "鬆一鬆", "告別熊貓眼", "舒服到訓著"],
  wordsToAvoid: ["治療失眠", "醫療功效", "消除黑眼圈"],
  proofPoints: ["日本進口發熱技術", "100%不含香料", "Cosmetics Canada 認證"],
  goals: "打入旅行必備品市場；建立高端個人護理品牌形象",
  brandVoice: {
    name: "OmmiCare",
    tagline: "你的私人眼部呵護專家",
    values: ["呵護", "品質", "便利"],
    voice: "像閨蜜一樣了解你的需要，給你溫柔呵護",
    style: ["温柔", "精緻", "放鬆"],
  },
};
