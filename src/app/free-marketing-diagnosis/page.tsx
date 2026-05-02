"use client";

import Header from "@/components/Header";
import { ArrowRight, ClipboardList, Megaphone, Search, Target, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const diagnosisItems = [
  {
    icon: Target,
    title: "定位判斷",
    desc: "先看產品或網站現在是否有清楚的廣告主張，避免一開始叫用戶選工具。",
  },
  {
    icon: Users,
    title: "香港受眾角度",
    desc: "拆出 2-3 個適合香港 Meta/IG 測試的受眾切入點。",
  },
  {
    icon: ClipboardList,
    title: "轉化缺口",
    desc: "指出 landing CTA、offer、內容表達裡最影響首輪投放的問題。",
  },
];

const paidItems = [
  "產品賣點提煉",
  "Meta/IG campaign structure",
  "廣東話/繁中廣告文案",
  "HKD 首輪測試預算建議",
];

export default function FreeMarketingDiagnosis() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setTimeout(() => {
      router.push(`/free-marketing-diagnosis/result?url=${encodeURIComponent(url)}`);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center mb-14">
          <section>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Free Marketing Diagnosis
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              貼上產品或網站 URL，
              <span className="text-cyan-300">先做一份香港市場診斷</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mb-8 leading-8">
              這是 Arclion 的獲客入口：先幫 SME owner 看清產品定位、香港受眾和投放缺口。
              真正付費價值會落在下一步：直接生成 Meta/IG 廣告方案、廣東話文案和 HKD 預算。
            </p>

            <form onSubmit={handleAnalyze} className="max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-store.com/product"
                  required
                  className="flex-1 px-5 py-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "正在生成..." : "免費診斷"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-3">
                無需登入。先看短診斷，認同方向後再進入廣告方案生成。
              </p>
            </form>
          </section>

          <section className="bg-slate-900/70 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Search className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-white font-semibold">用戶第一眼看到什麼</h2>
                <p className="text-slate-500 text-sm">Diagnosis first, tools later</p>
              </div>
            </div>
            <div className="space-y-3">
              {diagnosisItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <Icon className="w-5 h-5 text-cyan-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-medium text-sm">{item.title}</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-6">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="grid md:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              免費只回答一件事：值得怎樣投第一輪？
            </h2>
            <p className="text-slate-400 leading-7">
              我們先不把用戶丟進工具箱。免費診斷只給短、清楚、可判斷的方向；
              當用戶覺得方向準，才引導他生成完整廣告方案。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {paidItems.map((item) => (
              <div key={item} className="border border-slate-800 bg-slate-900/60 rounded-lg p-4 flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-cyan-300 flex-shrink-0" />
                <span className="text-slate-200 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 text-center border-t border-slate-800 pt-10">
          <h2 className="text-2xl font-bold text-white mb-4">已經有方向？直接進入 campaign studio</h2>
          <p className="text-slate-400 mb-7">登入後可以把診斷轉成受眾、ad set、文案和預算建議。</p>
          <Link
            href="/dashboard/product-marketing"
            className="inline-flex items-center gap-2 px-7 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-lg transition"
          >
            打開廣告方案生成
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
