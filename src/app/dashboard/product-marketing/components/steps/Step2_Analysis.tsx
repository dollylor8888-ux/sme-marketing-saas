'use client';

import { ChevronRight, ChevronLeft, Link2, Target, Users } from 'lucide-react';
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
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Marketing Diagnosis</h2>
        <p className="text-slate-400 text-sm">把 URL 轉成廣告 brief：產品主張、香港受眾和投放切入點</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-4">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-cyan-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
          <Target className="w-8 h-8 text-cyan-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm lg:text-base">{product.name}</h3>
          <div className="text-cyan-400 font-bold text-lg">{product.price}</div>
          <p className="text-slate-400 text-xs lg:text-sm mt-1">{product.description}</p>
          {product.url && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Link2 className="w-3.5 h-3.5" />
              <span className="truncate">{product.url}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-300" /> Campaign brief
        </h3>
        <div className="space-y-3">
          {product.features?.map((f, i) => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Input</span>
                <span className="text-white text-sm">{f.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Angle</span>
                <span className="text-slate-300 text-sm">轉成一個可以投放的香港市場訊息角度</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">Output</span>
                <span className="text-slate-300 text-sm">用於 ad set、文案 hook 或 landing CTA</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-300" /> 香港受眾與創意切入點
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
