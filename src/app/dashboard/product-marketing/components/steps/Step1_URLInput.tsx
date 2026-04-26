'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">輸入產品 URL</h2>
        <p className="text-slate-400 text-sm">粘貼任何電商平台的產品連結，AI 會自動分析</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">產品 URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
          />
          <p className="text-slate-500 text-xs mt-2">支援 Shopify, Amazon, 自網站等任何平台</p>
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
            <span>🔍</span>
            <span>分析產品</span>
          </>
        )}
      </button>
    </div>
  );
}
