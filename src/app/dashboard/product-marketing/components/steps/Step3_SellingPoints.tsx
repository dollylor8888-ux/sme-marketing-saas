'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { SellingPoint } from '../../types/product-marketing';

interface Step3_SellingPointsProps {
  initialPoints: SellingPoint[];
  onNext: (points: SellingPoint[]) => void;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  feature: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  benefit: 'bg-green-500/10 text-green-400 border-green-500/30',
  emotional: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  social: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  feature: '功能',
  benefit: '效益',
  emotional: '情感',
  social: '社會',
};

export default function Step3_SellingPoints({ initialPoints, onNext, onBack }: Step3_SellingPointsProps) {
  const [points, setPoints] = useState<SellingPoint[]>(initialPoints);
  const [newPoint, setNewPoint] = useState('');

  const togglePoint = (id: string) => {
    setPoints(points.map(p => p.id === id ? { ...p, confirmed: !p.confirmed } : p));
  };

  const addPoint = () => {
    if (!newPoint.trim()) return;
    setPoints([...points, { id: Date.now().toString(), point: newPoint, category: 'benefit', confirmed: true }]);
    setNewPoint('');
  };

  const confirmedCount = points.filter(p => p.confirmed).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">確認核心賣點</h2>
        <p className="text-slate-400 text-sm">使用 Benefit Laddering 確認最能打動受眾的賣點</p>
        <div className="mt-2 text-sm">
          <span className="text-green-400">{confirmedCount}</span>
          <span className="text-slate-400"> / {points.length} 已確認</span>
        </div>
      </div>

      <div className="space-y-3">
        {points.map((point) => (
          <div key={point.id} className={`border rounded-lg p-3 lg:p-4 transition ${point.confirmed ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => togglePoint(point.id)}
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition flex-shrink-0 ${
                  point.confirmed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-cyan-500'
                }`}
              >
                {point.confirmed && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[point.category]}`}>
                    {CATEGORY_LABELS[point.category]}
                  </span>
                </div>
                <p className="text-white text-sm lg:text-base">{point.point}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addPoint()}
          placeholder="新增一個賣點..."
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
        />
        <button onClick={addPoint} className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm">
          + 新增
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> 返回
        </button>
        <button onClick={() => onNext(points)} disabled={confirmedCount === 0} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
          確認 {confirmedCount} 個 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
