'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OptimizationOption {
  type: string;
  label: string;
  description: string;
  selected: boolean;
}

interface Step4_OptimizationProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step4_Optimization({ onNext, onBack }: Step4_OptimizationProps) {
  const [options, setOptions] = useState<OptimizationOption[]>([
    { type: 'seo', label: 'SEO 優化建議', description: 'Title, Meta Description, Keywords', selected: true },
    { type: 'copy', label: '賣點/產品描述優化', description: '更強的 benefit statements', selected: true },
    { type: 'landing', label: 'Landing Page 建議', description: '轉化率優化建議', selected: false },
    { type: 'images', label: '詳情圖建議', description: '圖片順序和文案', selected: false },
  ]);

  const toggleOption = (type: string) => {
    setOptions(options.map(o => o.type === type ? { ...o, selected: !o.selected } : o));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">選擇優化方向</h2>
        <p className="text-slate-400 text-sm">選擇你想獲取的優化建議（可多選）</p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => toggleOption(option.type)}
            className={`w-full p-4 rounded-xl border text-left transition ${
              option.selected ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                option.selected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'
              }`}>
                {option.selected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <div className="text-white font-medium text-sm lg:text-base">{option.label}</div>
                <div className="text-slate-400 text-xs lg:text-sm">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> 返回
        </button>
        <button onClick={onNext} disabled={!options.some(o => o.selected)} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
          生成建議 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
