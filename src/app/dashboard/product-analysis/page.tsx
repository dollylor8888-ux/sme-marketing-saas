"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Download,
  Save,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { ProductAnalysisOutput } from "@/lib/skills/product-analysis/types";

// ============ TYPES ============

interface FormData {
  productName: string;
  category: string;
  price: string;
  targetAudience: string;
  description: string;
  ingredients: string;
  usage: string;
  applicableScope: string;
  origin: string;
  brandFocus: string;
  competitors: string;
  additionalNotes: string;
}

// ============ MAIN COMPONENT ============

export default function ProductAnalysisPage() {
  const [step, setStep] = useState<"input" | "confirm" | "loading" | "result">("input");
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    category: "",
    price: "",
    targetAudience: "",
    description: "",
    ingredients: "",
    usage: "",
    applicableScope: "",
    origin: "",
    brandFocus: "",
    competitors: "",
    additionalNotes: "",
  });
  const [result, setResult] = useState<ProductAnalysisOutput | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle input change
  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setStep("loading");

    try {
      const response = await fetch("/api/product-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStep("result");
      } else {
        alert(data.error || "分析失敗，請稍後再試");
        setStep("confirm");
      }
    } catch {
      alert("網絡錯誤，請稍後再試");
      setStep("confirm");
    }
  }, [formData]);

  // Copy report to clipboard
  const copyReport = useCallback(() => {
    if (!result) return;
    const text = generatePlainTextReport(result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  // Generate plain text report
  const generatePlainTextReport = (r: ProductAnalysisOutput): string => {
    return `
【產品賣點分析報告】
${r.tagline}

━━━ FABS 賣點分析 ━━━

Feature（成分/特點）：
${r.fabs.feature}

Advantage（產品優勢）：
${r.fabs.advantage}

Benefit（顧客利益）：
${r.fabs.benefit}

Selling Point（銷售話術）：
${r.fabs.sellingPoint}

━━━ 使用場景 ━━━
${r.useCases.map((uc) => `
【${uc.id}】${uc.persona}
時機：${uc.when}
場合：${uc.where}
痛點：${uc.painPoint}
行動：${uc.action}
獎勵：${uc.reward}
感受：${uc.feeling}
`).join("")}

━━━ 情感價值 ━━━
${r.emotionalValues.map((ev, i) => `${i + 1}. ${ev.emotion}：${ev.hook}
   廣告角度：${ev.advertisingAngle}
`).join("")}

━━━ 差異化比較 ━━━
${r.differentiation.map((d, i) => `vs ${d.vs}：${d.ourAdvantage}
   Claim：${d.claim}
`).join("")}

━━━ 信任狀 ━━━
${r.proofPoints.map((pp, i) => `[${pp.type}] ${pp.content}
   可以宜家claim：${pp.canClaimNow ? "係" : "唔係"}
   ${pp.howToBuild ? `建立方法：${pp.howToBuild}` : ""}
`).join("")}
`.trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">產品賣點分析</h1>
            <p className="text-slate-400 text-sm">輸入產品資料，AI 幫你分析完整賣點同使用場景</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-6">
          {["輸入資料", "確認分析", "查看結果"].map((label, i) => {
            const stepIndex = i + 1;
            const currentStepIndex = step === "input" ? 1 : step === "confirm" ? 2 : step === "loading" ? 2 : 3;
            const isActive = stepIndex === currentStepIndex;
            const isComplete = stepIndex < currentStepIndex;

            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isComplete
                      ? "bg-cyan-500 text-white"
                      : isActive
                      ? "bg-cyan-500/20 border border-cyan-500 text-cyan-300"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {isComplete ? "✓" : stepIndex}
                </div>
                <span className={`text-sm ${isActive ? "text-white" : "text-slate-500"}`}>
                  {label}
                </span>
                {i < 2 && <ArrowRight className="w-4 h-4 text-slate-600 mx-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {step === "input" && (
        <InputStep formData={formData} onChange={handleChange} onSubmit={() => setStep("confirm")} />
      )}

      {step === "confirm" && (
        <ConfirmStep
          formData={formData}
          onChange={handleChange}
          onBack={() => setStep("input")}
          onAnalyze={handleSubmit}
        />
      )}

      {step === "loading" && <LoadingStep />}

      {step === "result" && result && (
        <ResultStep result={result} onCopy={copyReport} copied={copied} />
      )}
    </div>
  );
}

// ============ INPUT STEP ============

function InputStep({
  formData,
  onChange,
  onSubmit,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            產品名稱 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => onChange("productName", e.target.value)}
            placeholder="例如：OmmiCare 亮白精華液"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">產品類別</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => onChange("category", e.target.value)}
            placeholder="例如：護護品 / 面部精華"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">價錢</label>
          <input
            type="text"
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="例如：HK$388"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">目標客群</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => onChange("targetAudience", e.target.value)}
            placeholder="例如：25-45歲香港女性"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">產品描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="描述你嘅產品，例如：蘊含維他命C及透明質酸，深層保濕並提亮膚色"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          補充資料（令分析更準確）
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">主要成分</label>
            <input
              type="text"
              value={formData.ingredients}
              onChange={(e) => onChange("ingredients", e.target.value)}
              placeholder="例如：維他命C、透明質酸"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">使用方式</label>
            <input
              type="text"
              value={formData.usage}
              onChange={(e) => onChange("usage", e.target.value)}
              placeholder="例如：早晚各2滴"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">適用範圍</label>
            <input
              type="text"
              value={formData.applicableScope}
              onChange={(e) => onChange("applicableScope", e.target.value)}
              placeholder="例如：所有膚質"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">產地</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => onChange("origin", e.target.value)}
              placeholder="例如：韓國"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">品牌重點</label>
          <input
            type="text"
            value={formData.brandFocus}
            onChange={(e) => onChange("brandFocus", e.target.value)}
            placeholder="你想強調嘅重點，例如：方便、有效"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">競爭對手</label>
          <input
            type="text"
            value={formData.competitors}
            onChange={(e) => onChange("competitors", e.target.value)}
            placeholder="例如：Innisfree, Laneige"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={!formData.productName.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition"
        >
          下一步：確認資料
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============ CONFIRM STEP ============

function ConfirmStep({
  formData,
  onChange,
  onBack,
  onAnalyze,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">請確認以下資料</h2>
        <p className="text-slate-400 text-sm">確認無誤後開始分析</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { key: "productName", label: "產品名稱" },
          { key: "category", label: "產品類別" },
          { key: "price", label: "價錢" },
          { key: "targetAudience", label: "目標客群" },
          { key: "ingredients", label: "主要成分" },
          { key: "usage", label: "使用方式" },
          { key: "applicableScope", label: "適用範圍" },
          { key: "origin", label: "產地" },
          { key: "brandFocus", label: "品牌重點" },
          { key: "competitors", label: "競爭對手" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-1">{label}</label>
            <input
              type="text"
              value={formData[key as keyof FormData]}
              onChange={(e) => onChange(key as keyof FormData, e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">產品描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">補充資料（可選）</label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => onChange("additionalNotes", e.target.value)}
          placeholder="任何其他你想提供嘅資料，可以令分析更準確"
          rows={2}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          返回修改
        </button>
        <button
          onClick={onAnalyze}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition"
        >
          <Sparkles className="w-4 h-4" />
          開始 AI 分析（20 Credits）
        </button>
      </div>
    </div>
  );
}

// ============ LOADING STEP ============

function LoadingStep() {
  return (
    <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">AI 正在分析...</h2>
      <p className="text-slate-400">請稍候，通常需要 15-30 秒</p>
    </div>
  );
}

// ============ RESULT STEP ============

function ResultStep({
  result,
  onCopy,
  copied,
}: {
  result: ProductAnalysisOutput;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "已複製" : "複製報告"}
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition">
          <Download className="w-4 h-4" />
          下載 PDF
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition">
          <Save className="w-4 h-4" />
          存入 Brand Memory
        </button>
      </div>

      {/* Tagline */}
      <div className="border border-cyan-500/30 bg-cyan-500/5 rounded-xl p-6">
        <div className="text-sm text-cyan-400 mb-2">📌 一句話定位</div>
        <div className="text-xl font-bold text-white">{result.tagline}</div>
      </div>

      {/* FABS */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          1️⃣ FABS 賣點分析
        </h3>
        <div className="space-y-4">
          {[
            { label: "Feature（成分/特點）", value: result.fabs.feature },
            { label: "Advantage（產品優勢）", value: result.fabs.advantage },
            { label: "Benefit（顧客利益）", value: result.fabs.benefit },
            { label: "Selling Point（銷售話術）", value: result.fabs.sellingPoint },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-sm text-slate-400 mb-1">{label}</div>
              <div className="text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          2️⃣ 使用場景
        </h3>
        <div className="space-y-6">
          {result.useCases.map((uc) => (
            <div key={uc.id} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded">
                  {uc.id}
                </span>
                <span className="text-white font-medium">{uc.persona}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">時機：</span>
                  <span className="text-slate-200">{uc.when}</span>
                </div>
                <div>
                  <span className="text-slate-400">場合：</span>
                  <span className="text-slate-200">{uc.where}</span>
                </div>
                <div>
                  <span className="text-slate-400">痛點：</span>
                  <span className="text-slate-200">{uc.painPoint}</span>
                </div>
                <div>
                  <span className="text-slate-400">行動：</span>
                  <span className="text-slate-200">{uc.action}</span>
                </div>
                <div>
                  <span className="text-slate-400">獎勵：</span>
                  <span className="text-slate-200">{uc.reward}</span>
                </div>
                <div>
                  <span className="text-slate-400">感受：</span>
                  <span className="text-slate-200">{uc.feeling}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Values */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          3️⃣ 情感價值
        </h3>
        <div className="space-y-4">
          {result.emotionalValues.map((ev, i) => (
            <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded">
                  {ev.emotion}
                </span>
              </div>
              <div className="text-sm text-slate-400 mb-1">Hook：{ev.hook}</div>
              <div className="text-sm text-slate-300">廣告角度：{ev.advertisingAngle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Differentiation */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          4️⃣ 差異化比較
        </h3>
        <div className="space-y-4">
          {result.differentiation.map((d, i) => (
            <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">vs {d.vs}</div>
              <div className="text-white font-medium mb-2">{d.ourAdvantage}</div>
              <div className="text-sm text-cyan-300">Claim：{d.claim}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof Points */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          5️⃣ 信任狀
        </h3>
        <div className="space-y-4">
          {result.proofPoints.map((pp, i) => (
            <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded uppercase">
                  {pp.type}
                </span>
                {pp.canClaimNow ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    可宜家claim
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
                    需要建立
                  </span>
                )}
              </div>
              <div className="text-white mb-2">{pp.content}</div>
              {pp.howToBuild && (
                <div className="text-sm text-slate-400">建立方法：{pp.howToBuild}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Action */}
      <div className="border border-slate-700 bg-slate-800/60 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">下一步</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
          >
            返回 Dashboard
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-sm transition">
            下一步：生成 Tagline
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
