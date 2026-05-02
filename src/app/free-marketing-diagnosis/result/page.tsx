import Header from "@/components/Header";
import { buildMarketingDiagnosis } from "@/lib/marketing/diagnosis";
import { ArrowLeft, ArrowRight, Check, Lock, Megaphone, Target, Users } from "lucide-react";
import Link from "next/link";

interface ResultPageProps {
  searchParams: Promise<{ url?: string }>;
}

export default async function DiagnosisResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const analyzedUrl = params.url || "your-store.com";
  const diagnosis = buildMarketingDiagnosis(analyzedUrl);
  const studioPath = `/dashboard/product-marketing?url=${encodeURIComponent(diagnosis.normalizedUrl)}`;
  const signUpPath = `/sign-up?redirect_url=${encodeURIComponent(studioPath)}`;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/free-marketing-diagnosis"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          重新診斷另一個 URL
        </Link>

        <section className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-300 mb-4">
            <Check className="w-4 h-4" />
            Diagnosis ready for {diagnosis.domain}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {diagnosis.brandName} 的香港 marketing diagnosis
          </h1>
          <p className="text-slate-300 max-w-3xl leading-7">
            {diagnosis.summary} 以下是免費版先交付的短診斷：定位、受眾、轉化缺口。
            下一步可以把這份 brief 直接轉成 Meta/IG 廣告方案。
          </p>
        </section>

        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-white font-semibold">免費診斷</h2>
                <p className="text-slate-500 text-sm">讓用戶先判斷方向是否準確</p>
              </div>
            </div>

            <div className="space-y-4">
              {diagnosis.freeInsights.map((insight) => (
                <article key={insight.title} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-cyan-300 text-xs font-medium uppercase tracking-wide mb-2">
                    {insight.title}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{insight.finding}</h3>
                  <p className="text-slate-400 text-sm leading-6">{insight.action}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-white font-semibold">第一輪 quick wins</h2>
                <p className="text-slate-500 text-sm">不用新增功能也能立即測試</p>
              </div>
            </div>
            <div className="space-y-3">
              {diagnosis.quickWins.map((item) => (
                <div key={item} className="flex gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <span className="leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-lg border border-cyan-500/25 bg-slate-900/80 p-6">
          <div className="absolute right-6 top-6 hidden sm:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            Paid campaign plan
          </div>

          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 text-cyan-300 text-sm font-medium mb-3">
              <Megaphone className="w-4 h-4" />
              核心付費價值
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              生成完整 Meta/IG 廣告方案
            </h2>
            <p className="text-slate-400 leading-7">
              我們不再把下一步包裝成一堆工具，而是把這個 URL 直接轉成香港受眾、
              campaign structure、廣東話/繁中廣告文案和 HKD 預算建議。
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-white font-medium mb-3">
                <Users className="w-4 h-4 text-cyan-300" />
                HK audience
              </div>
              <div className="space-y-3">
                {diagnosis.audienceSegments.map((segment) => (
                  <div key={segment.name}>
                    <div className="text-slate-200 text-sm font-medium">{segment.name}</div>
                    <p className="text-slate-500 text-xs leading-5">{segment.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-white font-medium mb-3">Campaign structure</div>
              <div className="space-y-2">
                {diagnosis.campaignPlan.structure.map((item) => (
                  <div key={item} className="text-slate-400 text-xs leading-5">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 text-cyan-200 text-xs">
                {diagnosis.campaignPlan.budget}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-white font-medium mb-3">Ad copy preview</div>
              {diagnosis.campaignPlan.copySamples.map((sample) => (
                <div key={sample.headline} className="space-y-3">
                  <h3 className="text-cyan-300 font-semibold">{sample.headline}</h3>
                  <p className="text-slate-300 text-sm leading-6">{sample.primaryText}</p>
                  <div className="inline-flex rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    CTA: {sample.cta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={signUpPath}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition"
            >
              用這個 URL 生成廣告方案
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition"
            >
              查看 HKD pricing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
