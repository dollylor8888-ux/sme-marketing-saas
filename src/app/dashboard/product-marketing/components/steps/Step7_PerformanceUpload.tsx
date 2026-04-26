'use client';

import { useState } from 'react';
import { ChevronLeft, Check, Upload, Loader2 } from 'lucide-react';
import { AnalysisResult, AdSetRanking, AssetRanking, Insight, Recommendation } from '../../types/product-marketing';

interface Step7_PerformanceUploadProps {
  workspaceId?: string;
  onBack: () => void;
  onComplete?: () => void;
}

export default function Step7_PerformanceUpload({ workspaceId, onBack, onComplete }: Step7_PerformanceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) {
      setFile(f);
    }
  };

  const handleUpload = async () => {
    if (!file || !workspaceId) return;
    setUploading(true);
    
    // Mock upload result
    await new Promise(r => setTimeout(r, 2000));
    
    setResult({
      success: true,
      rowsImported: 45,
      summary: {
        totalSpend: 12500,
        totalConversions: 156,
        avgROAS: 2.8,
        totalAdSets: 3,
        totalAssets: 5,
      },
      topAdSets: [
          { name: '香港女性 25-40', roas: 3.5, conversions: 89, spend: 6500 },
          { name: 'Lookalike 1%', roas: 2.8, conversions: 45, spend: 4000 },
          { name: '再行銷 - 訪客', roas: 1.8, conversions: 22, spend: 2000 },
        ] as AdSetRanking[],
        topAssets: [
          { name: 'mother_day_v1.jpg', ctr: 4.5, conversions: 67, spend: 0 },
          { name: 'lifestyle_shot.jpg', ctr: 3.2, conversions: 45, spend: 0 },
        ] as AssetRanking[],
        insights: [
          { type: 'winning_audience', content: '受眾「香港女性 25-40」表現最佳，ROAS 達 3.5x', confidence: 0.9 },
          { type: 'winning_creative', content: '素材「mother_day_v1.jpg」CTR 達 4.5%，點擊率優秀', confidence: 0.85 },
        ] as Insight[],
        recommendations: [
          { type: 'budget_increase', content: '建議增加「香港女性 25-40」預算，可測試 +30%', priority: 'high' },
          { type: 'test_variations', content: '建議對錶現好的受眾和素材組合進行 A/B 測試', priority: 'medium' },
        ] as Recommendation[],
    });
    
    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">成效追蹤</h2>
        <p className="text-slate-400 text-sm">上傳廣告成效數據，AI 分析並給出優化建議</p>
      </div>

      {!result ? (
        <>
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              dragOver ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-white font-medium mb-2">
              {file ? file.name : '拖放 CSV/Excel 到這裡'}
            </p>
            {!file && (
              <p className="text-slate-400 text-sm mb-4">或點擊選擇文件</p>
            )}
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition text-sm inline-block"
            >
              選擇文件
            </label>
          </div>

          {/* Facebook Coming Soon */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <div className="text-white font-medium text-sm">Facebook 自動同步</div>
                <div className="text-slate-400 text-xs">正在開發中...</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Coming Soon</span>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || !workspaceId || uploading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>上傳分析中...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>上傳並分析</span>
              </>
            )}
          </button>
        </>
      ) : (
        /* Results */
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4 text-sm">📊 成效概覽</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">總 Spend</div>
                <div className="text-white font-bold text-lg">HK${result.summary.totalSpend.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">總轉化</div>
                <div className="text-white font-bold text-lg">{result.summary.totalConversions}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">平均 ROAS</div>
                <div className="text-green-400 font-bold text-lg">{result.summary.avgROAS.toFixed(2)}x</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">廣告系列</div>
                <div className="text-white font-bold text-lg">{result.summary.totalAdSets}</div>
              </div>
            </div>
          </div>

          {/* Top AdSets */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3 text-sm">🏆 受眾表現排行</h3>
            <div className="space-y-2">
              {result.topAdSets.map((adset: AdSetRanking, i: number) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm">{adset.name}</div>
                    <div className="text-slate-400 text-xs">Spend: HK${adset.spend.toLocaleString()} · 轉化: {adset.conversions}</div>
                  </div>
                  <div className={`font-bold ${adset.roas >= 3 ? 'text-green-400' : adset.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {adset.roas.toFixed(1)}x
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Assets */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3 text-sm">🎨 素材表現排行</h3>
            <div className="space-y-2">
              {result.topAssets.map((asset: AssetRanking, i: number) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm flex items-center gap-2">
                      <span>📎</span> {asset.name}
                    </div>
                    <div className="text-slate-400 text-xs">轉化: {asset.conversions}</div>
                  </div>
                  <div className={`font-bold ${asset.ctr >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
                    CTR {asset.ctr.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3 text-sm">💡 AI 洞察</h3>
            <div className="space-y-2">
              {result.insights.map((insight: Insight, i: number) => (
                <div key={i} className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                  <p className="text-cyan-400 text-sm">{insight.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3 text-sm">📋 優化建議</h3>
            <div className="space-y-2">
              {result.recommendations.map((rec: Recommendation, i: number) => (
                <div key={i} className={`rounded-lg p-3 ${
                  rec.priority === 'high' ? 'bg-green-500/5 border border-green-500/20' : 'bg-slate-900/50'
                }`}>
                  <p className="text-white text-sm">{rec.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" /> 返回
            </button>
            <button onClick={onComplete} className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg transition flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> 完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
