'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChevronRight, ChevronLeft, Check, Trash2, Plus, Loader2 } from 'lucide-react';
import { SellingPoint, ProductInfo, AdDirection, AdSetData, AdData, CampaignData } from '../../types/product-marketing';

interface Step5_CampaignStructureProps {
  sellingPoints: SellingPoint[];
  product: ProductInfo;
  onNext: (campaign: CampaignData) => void;
  onBack: () => void;
}

const OBJECTIVES = [
  { value: 'awareness', label: '品牌認知', icon: '📢' },
  { value: 'lead', label: 'Lead Generation', icon: '📧' },
  { value: 'sales', label: '直接銷售', icon: '💰' },
  { value: 'retargeting', label: '再行銷', icon: '🔄' },
];

export default function Step5_CampaignStructure({ sellingPoints, product, onNext, onBack }: Step5_CampaignStructureProps) {
  const [phase, setPhase] = useState<'direction' | 'structure'>('direction');
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState<AdDirection[]>([]);
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { userId } = useAuth();

  const [campaign, setCampaign] = useState<CampaignData>({
    name: '',
    objective: 'sales',
    platform: 'facebook',
    totalBudget: 0,
    adSets: [],
  });

  const handleGenerateDirections = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ad-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product?.name || 'Product',
          productDescription: product?.description || '',
          features: product?.features || [],
          sellingPoints: sellingPoints.filter(sp => sp.confirmed),
          targetAudience: product?.analysis?.targetAudience || '',
          platform: 'both',
          objective: 'sales',
        }),
      });

      const data = await res.json();
      if (data.success && data.directions) {
        const parsed = Array.isArray(data.directions) ? data.directions : [];
        setDirections(parsed.map((d: AdDirection, i: number) => ({
          id: `dir-${i}`,
          name: d.name || `方向 ${i + 1}`,
          strategy: d.strategy || '',
          audienceDesc: d.audienceDesc || '',
          creativeDirection: d.creativeDirection || '',
          mainSellingPoint: d.mainSellingPoint || '',
          platform: d.platform || 'facebook',
          adsetCount: d.adsetCount || 1,
          estimatedBudget: d.estimatedBudget || '33%',
        })));
      } else {
        setError(data.error || '生成失敗');
      }
    } catch {
      setError('請求失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDirections = () => {
    if (selectedDirections.length === 0) {
      setError('請至少選擇一個方向');
      return;
    }

    const selected = directions.filter(d => selectedDirections.includes(d.id));
    const adSets: AdSetData[] = selected.map((d, i) => ({
      id: `adset-${i}`,
      name: d.name,
      audienceDesc: d.audienceDesc,
      budgetPercent: Math.round(100 / selected.length),
      ads: Array.from({ length: d.adsetCount }, (_, j) => ({
        id: `ad-${i}-${j}`,
        name: `Ad ${j + 1}`,
        assetName: '',
        assetType: 'image' as const,
      })),
    }));

    setCampaign(prev => ({
      ...prev,
      name: product?.name ? `${product.name} 推廣` : '新 Campaign',
      adSets,
    }));

    setPhase('structure');
  };

  const toggleDirection = (id: string) => {
    setSelectedDirections(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const updateAdSet = (id: string, field: string, value: string | number) => {
    setCampaign({
      ...campaign,
      adSets: campaign.adSets.map(as => as.id === id ? { ...as, [field]: value } : as),
    });
  };

  const updateAd = (adsetId: string, adId: string, field: string, value: string) => {
    setCampaign({
      ...campaign,
      adSets: campaign.adSets.map(as =>
        as.id === adsetId
          ? { ...as, ads: as.ads.map(ad => ad.id === adId ? { ...ad, [field]: value } : ad) }
          : as
      ),
    });
  };

  const addAd = (adsetId: string) => {
    setCampaign({
      ...campaign,
      adSets: campaign.adSets.map(as =>
        as.id === adsetId
          ? { ...as, ads: [...as.ads, { id: Date.now().toString(), name: `Ad ${as.ads.length + 1}`, assetName: '', assetType: 'image' }] }
          : as
      ),
    });
  };

  const removeAd = (adsetId: string, adId: string) => {
    setCampaign({
      ...campaign,
      adSets: campaign.adSets.map(as =>
        as.id === adsetId ? { ...as, ads: as.ads.filter(ad => ad.id !== adId) } : as
      ),
    });
  };

  const totalBudgetPercent = campaign.adSets.reduce((sum, as) => sum + as.budgetPercent, 0);

  // ============ PHASE 1: SELECT AD DIRECTIONS ============
  if (phase === 'direction') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">選擇廣告方向</h2>
          <p className="text-slate-400 text-sm">AI 會根據你的產品分析生成多個廣告方向，選擇適合的進入下一步</p>
        </div>

        {!directions.length && !loading && (
          <div className="text-center">
            <button
              onClick={handleGenerateDirections}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 mx-auto"
            >
              <Loader2 className="w-5 h-5" />
              AI 生成廣告方向
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
            <p className="text-slate-400">AI 正在分析並生成廣告方向...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {directions.length > 0 && (
          <>
            <div className="space-y-3">
              {directions.map((dir) => (
                <div
                  key={dir.id}
                  onClick={() => toggleDirection(dir.id)}
                  className={`bg-slate-800/50 border rounded-xl p-4 cursor-pointer transition ${
                    selectedDirections.includes(dir.id)
                      ? 'border-cyan-500 ring-1 ring-cyan-500'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedDirections.includes(dir.id) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                    }`}>
                      {selectedDirections.includes(dir.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold">{dir.name}</h4>
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                          {dir.platform === 'both' ? 'FB + IG' : dir.platform}
                        </span>
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                          預算 {dir.estimatedBudget}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{dir.strategy}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">受眾：</span>
                          <span className="text-slate-300">{dir.audienceDesc}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">主打：</span>
                          <span className="text-slate-300">{dir.mainSellingPoint}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="text-slate-500">創意方向：</span>
                        <span className="text-slate-400">{dir.creativeDirection}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleConfirmDirections}
                disabled={selectedDirections.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                確認方向並繼續
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 border border-slate-700 text-slate-400 rounded-lg hover:border-slate-600 transition"
              >
                返回
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ============ PHASE 2: BUILD CAMPAIGN STRUCTURE ============
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">建立 Campaign 結構</h2>
        <p className="text-slate-400 text-sm">確認廣告方向後，設定 Campaign 詳情和預算分配</p>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-cyan-500" />
          <span className="text-cyan-400 text-sm font-medium">已選擇方向</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedDirections.map(id => {
            const d = directions.find(dir => dir.id === id);
            return d ? (
              <span key={id} className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                {d.name}
              </span>
            ) : null;
          })}
        </div>
        <button
          onClick={() => setPhase('direction')}
          className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
        >
          返回修改方向
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Campaign 名稱</label>
          <input
            type="text"
            value={campaign.name}
            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
            placeholder="e.g., 母親節 Earbuds 推廣"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">廣告目標</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {OBJECTIVES.map((obj) => (
              <button
                key={obj.value}
                onClick={() => setCampaign({ ...campaign, objective: obj.value })}
                className={`p-3 rounded-lg border text-center transition ${
                  campaign.objective === obj.value
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="text-xl mb-1">{obj.icon}</div>
                <div className="text-white text-xs">{obj.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">總預算 (HKD)</label>
          <input
            type="number"
            value={campaign.totalBudget || ''}
            onChange={(e) => setCampaign({ ...campaign, totalBudget: parseFloat(e.target.value) || 0 })}
            placeholder="e.g., 5000"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium text-sm">Ad Sets (受眾)</h3>
          <span className={`text-xs ${totalBudgetPercent === 100 ? 'text-green-400' : 'text-red-400'}`}>
            預算分配: {totalBudgetPercent}%
          </span>
        </div>

        {campaign.adSets.map((adset) => (
          <div key={adset.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 text-sm font-medium">{adset.name}</span>
              <button
                onClick={() => setCampaign({ ...campaign, adSets: campaign.adSets.filter(as => as.id !== adset.id) })}
                className="p-1 text-slate-400 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Ad Set 名稱</label>
                <input
                  type="text"
                  value={adset.name}
                  onChange={(e) => updateAdSet(adset.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">受眾描述</label>
                <input
                  type="text"
                  value={adset.audienceDesc}
                  onChange={(e) => updateAdSet(adset.id, 'audienceDesc', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">預算分配 (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={adset.budgetPercent}
                  onChange={(e) => updateAdSet(adset.id, 'budgetPercent', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-20 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
                <div className="flex-1 bg-slate-900 rounded-lg h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-lg transition"
                    style={{ width: `${adset.budgetPercent}%` }}
                  />
                </div>
                {campaign.totalBudget > 0 && (
                  <span className="text-slate-400 text-xs">
                    HK${Math.round(campaign.totalBudget * adset.budgetPercent / 100)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Ads (廣告)</span>
                <button
                  onClick={() => addAd(adset.id)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 新增廣告
                </button>
              </div>

              {adset.ads.map((ad) => (
                <div key={ad.id} className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={ad.name}
                      onChange={(e) => updateAd(adset.id, ad.id, 'name', e.target.value)}
                      placeholder="Ad 名稱"
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder-slate-500"
                    />
                    {adset.ads.length > 1 && (
                      <button
                        onClick={() => removeAd(adset.id, ad.id)}
                        className="p-1 text-slate-400 hover:text-red-400 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ad.assetName}
                    onChange={(e) => updateAd(adset.id, ad.id, 'assetName', e.target.value)}
                    placeholder="素材檔案名 (追蹤用)"
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs placeholder-slate-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={() => onNext(campaign)}
          disabled={!campaign.name || totalBudgetPercent !== 100}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          繼續到創意素材
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPhase('direction')}
          className="px-6 py-3 border border-slate-700 text-slate-400 rounded-lg hover:border-slate-600 transition"
        >
          返回方向
        </button>
      </div>
    </div>
  );
}
