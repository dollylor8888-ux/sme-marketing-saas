import { IndustryTemplate, SellingPoint } from '../types/product-marketing';

export const ECOMMERCE_TEMPLATE: IndustryTemplate = {
  name: '電商產品',
  icon: '🛒',
  mockProduct: {
    name: 'Premium Wireless Earbuds Pro',
    price: '$129',
    platform: 'shopify',
    url: '',
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
  },
  sellingPoints: [
    { id: '1', point: '30小時超長續航 — 業界最長', category: 'benefit', confirmed: false },
    { id: '2', point: '主動降噪技術 — 讓你隨時專注', category: 'benefit', confirmed: false },
    { id: '3', point: 'Hi-Res 認證音效 — 享受每個音樂細節', category: 'benefit', confirmed: false },
    { id: '4', point: '一秒藍牙連接 — 不需等待', category: 'feature', confirmed: false },
    { id: '5', point: 'IPX5防水防汗 — 無懼運動雨天', category: 'benefit', confirmed: false },
    { id: '6', point: '時尚輕巧設計 — 單耳僅5g', category: 'emotional', confirmed: false },
  ] as SellingPoint[],
};
