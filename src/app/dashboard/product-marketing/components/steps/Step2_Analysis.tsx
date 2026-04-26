'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ProductInfo } from '../../types/product-marketing';

interface Step2_AnalysisProps {
  product: ProductInfo;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2_Analysis({ product, onNext, onBack }: Step2_AnalysisProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">AI 產品分析</h2>
        <p className="text-slate-400 text-sm">使用 FAB、AIDA 等框架分析產品價值</p>
      </div>

      {/* Product Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-4">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-700 rounded-lg flex items-center justify-center text-2xl lg:text-3xl flex-shrink-0">
          📦
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm lg:text-base">{product.name}</h3>
          <div className="text-cyan-400 font-bold text-lg">{product.price}</div>
          <p className="text-slate-400 text-xs lg:text-sm mt-1">{product.description}</p>
        </div>
      </div>

      {/* FAB Analysis */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
          <span className="text-cyan-400">📋</span> FAB 分析 (Feature → Advantage → Benefit)
        </h3>
        <div className="space-y-3">
          {product.features?.map((f, i) => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Feature</span>
                <span className="text-white text-sm">{f.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Advantage</span>
                <span className="text-slate-300 text-sm">比其他品牌更持久、更穩定</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">Benefit</span>
                <span className="text-slate-300 text-sm">讓{f.name.includes('30-hour') ? '你一整天' : '你'}無需充電，專注做事</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
          <span className="text-orange-400">👥</span> 目標受眾分析 (AIDA)
        </h3>
        <p className="text-slate-300 text-sm mb-3">{product.analysis?.targetAudience}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">情感驅動</div>
            <div className="flex flex-wrap gap-1">
              {product.analysis?.emotionalDrivers?.map((e, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">{e}</span>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">使用場景</div>
            <div className="flex flex-wrap gap-1">
              {product.analysis?.useCases?.map((u, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">{u}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> 返回
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition flex items-center justify-center gap-2">
          確認分析 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
