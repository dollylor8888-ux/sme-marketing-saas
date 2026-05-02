'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Search } from 'lucide-react';

interface Step1_URLInputProps {
  onNext: (url: string) => void;
}

export default function Step1_URLInput({ onNext }: Step1_URLInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext(url);
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-cyan-500/15 flex items-center justify-center">
          <Search className="w-6 h-6 text-cyan-300" />
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">貼上產品或網站 URL</h2>
        <p className="text-slate-400 text-sm leading-6">
          先生成一份 campaign-ready diagnosis，再進入受眾、廣告結構、文案和預算建議。
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-5 space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">產品 URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-store.com/product"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
          />
          <p className="text-slate-500 text-xs mt-2">支援 Shopify、自網站、餐廳頁面、服務頁面等 URL</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          {['定位與 offer', '香港受眾', 'Meta/IG 結構'].map((item) => (
            <div key={item} className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!url || loading}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI 正在分析...</span>
          </>
        ) : (
          <>
            <span>生成免費診斷</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
