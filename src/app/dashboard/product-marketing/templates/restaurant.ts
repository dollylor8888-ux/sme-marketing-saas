import { IndustryTemplate, SellingPoint } from '../types/product-marketing';

export const RESTAURANT_TEMPLATE: IndustryTemplate = {
  name: '餐廳/餐飲',
  icon: '🍜',
  mockProduct: {
    name: '御品麻辣鍋',
    price: 'HK$388/位',
    description: '精選日本A5和牛、法國海鮮、手工丸類，麻辣湯底採用28種香料熬製',
    features: [
      { name: '日本A5和牛', category: 'feature' },
      { name: '法國空運海鮮', category: 'feature' },
      { name: '28種香料麻辣湯底', category: 'feature' },
      { name: '手工丸類', category: 'feature' },
      { name: '頂級備長炭火鍋', category: 'feature' },
      { name: 'VIP包廂', category: 'feature' },
    ],
    analysis: {
      targetAudience: '美食愛好者 28-55歲，追求高品質餐飲體驗的家庭和商務客',
      emotionalDrivers: ['尊貴', '享受', '難忘'],
      useCases: ['家庭聚會', '商務應酬', '情侶約會', '節慶慶祝'],
    }
  },
  sellingPoints: [
    { id: 'r1', point: '日本A5和牛 — 入口即化', category: 'benefit', confirmed: false },
    { id: 'r2', point: '28種香料麻辣湯底 — 層次豐富', category: 'benefit', confirmed: false },
    { id: 'r3', point: '法國空運海鮮 — 新鮮保證', category: 'benefit', confirmed: false },
    { id: 'r4', point: 'VIP包廂服務 — 私密度高', category: 'emotional', confirmed: false },
    { id: 'r5', point: '備長炭火鍋 — 保留原汁原味', category: 'feature', confirmed: false },
    { id: 'r6', point: '節慶限定套餐 — 特別優惠', category: 'social', confirmed: false },
  ] as SellingPoint[],
};
