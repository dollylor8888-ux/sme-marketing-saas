'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { CampaignData } from '../../types/product-marketing';

interface Step6_CreativeContentProps {
  campaign: CampaignData;
  onNext: () => void;
  onBack: () => void;
}

interface GeneratedAd {
  headline?: string;
  primaryText?: string;
  cta?: string;
  script?: string;
}

export default function Step6_CreativeContent({ campaign, onNext, onBack }: Step6_CreativeContentProps) {
  const [generatedAds, setGeneratedAds] = useState<{
    [key: string]: GeneratedAd
  }>({});

  const allAds = campaign.adSets.flatMap((as, asIdx) => 
    as.ads.map((ad, adIdx) => ({
      key: `${asIdx}-${adIdx}`,
      ad,
      label: `${as.name || `Ad Set ${asIdx + 1}`} > ${ad.name}`,
    }))
  );

  const generateAd = (key: string) => {
    // Mock generated content
    setGeneratedAds({
      ...generatedAds,
      [key]: {
        headline: '30小時續航，音樂不停歇',
        primaryText: '告別電量焦慮！Premium Earbuds Pro 讓你一整天專注做事。',
        cta: '立即選購',
        script: '（0-3秒）你有沒有想過，為什麼有些人總是能專注工作？\n（3-15秒）這就是為什麼我們設計了 Premium Earbuds Pro。30小時續航，主動降噪。\n（15-30秒）點擊下方連結，今天就改變你的聽覺體驗！',
      },
    });
  };

  const hasGenerated = Object.keys(generatedAds).length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">生成創意內容</h2>
        <p className="text-slate-400 text-sm">為每個廣告生成 FB/IG 文案和視頻腳本</p>
      </div>

      <div className="space-y-4">
        {allAds.map(({ key, ad, label }) => (
          <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium text-sm">{label}</span>
                {ad.assetName && (
                  <span className="ml-2 text-xs text-slate-400">📎 {ad.assetName}</span>
                )}
              </div>
              <button
                onClick={() => generateAd(key)}
                className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition text-xs"
              >
                生成文案
              </button>
            </div>

            {generatedAds[key] && (
              <div className="space-y-3 pt-3 border-t border-slate-700">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Headline</label>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-white text-sm">{generatedAds[key].headline}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Primary Text</label>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-300 text-sm">{generatedAds[key].primaryText}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CTA</label>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-cyan-400 text-sm">{generatedAds[key].cta}</p>
                  </div>
                </div>
                {ad.assetType === 'video' && generatedAds[key].script && (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">視頻腳本</label>
                    <div className="bg-slate-900 rounded-lg p-3">
                      <p className="text-slate-300 text-sm whitespace-pre-line">{generatedAds[key].script}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> 返回
        </button>
        <button 
          onClick={onNext} 
          disabled={!hasGenerated}
          className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          完成並儲存 <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
