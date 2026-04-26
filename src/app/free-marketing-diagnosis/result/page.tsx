import Header from "@/components/Header";
import Link from "next/link";
import { Lock, Check, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface ResultPageProps {
  searchParams: Promise<{ url?: string }>;
}

export default async function DiagnosisResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const analyzedUrl = params.url || "your-store.com";

  // Mock diagnosis data
  const freeInsight = {
    type: "positioning",
    badge: "FREE PREVIEW",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: "🎯",
    title: "Your Brand Positioning",
    finding: "Strong differentiation in quality vs price perception",
    detail: "Your brand is perceived as &quot;premium but affordable&quot; — a rare position that 78% of competitors struggle to achieve. Your messaging around &quot;value without compromise&quot; resonates well with your target demographic.",
    recommendation: "Double down on this positioning in your ads. A/B test messaging that leads with quality and frames price as an investment.",
  };

  const lockedInsights = [
    {
      type: "audience",
      badge: "LOCKED",
      badgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      icon: "👥",
      title: "Target Audience Analysis",
      summary: "Your primary audience is: Women 25-40, urban, values convenience...",
    },
    {
      type: "content",
      badge: "LOCKED",
      badgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      icon: "📝",
      title: "Content Gap Analysis",
      summary: "Missing educational content about product care and usage tips...",
    },
    {
      type: "seo",
      badge: "LOCKED",
      badgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      icon: "🔍",
      title: "SEO Opportunity",
      summary: "High-volume keyword &quot;best [category]&quot; has low competition on your site...",
    },
    {
      type: "competitor",
      badge: "LOCKED",
      badgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      icon: "🏆",
      title: "Competitor Weakness",
      summary: "Your competitors&apos; main weakness is customer service response time...",
    },
    {
      type: "growth",
      badge: "LOCKED",
      badgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      icon: "🚀",
      title: "Top Growth Opportunity",
      summary: "Expanding to cross-sell accessories could increase AOV by 23%...",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/free-marketing-diagnosis"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Try another URL
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400 mb-4">
            <Check className="w-4 h-4" />
            Analysis Complete for {analyzedUrl}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Brand Diagnosis Report
          </h1>
          <p className="text-slate-400">
            Here&apos;s what we found about your brand&apos;s marketing position.
          </p>
        </div>

        {/* FREE Insight - Visible */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium mb-4">
            {freeInsight.badge}
          </div>
          <div className="bg-slate-800/80 border border-green-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">{freeInsight.icon}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">{freeInsight.title}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm">
                  <Check className="w-4 h-4" />
                  {freeInsight.finding}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
              <p className="text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: freeInsight.detail }} />
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
              <div className="text-cyan-400 text-sm font-medium mb-2">💡 Recommendation</div>
              <p className="text-slate-300 text-sm">{freeInsight.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Gradient Fade Overlay */}
        <div className="relative h-24 -mt-8 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        {/* LOCKED Insights - Blurred */}
        <div className="relative">
          {/* Lock Overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Unlock Full Diagnosis
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Get all {lockedInsights.length + 1} insights including audience analysis, 
                competitor intel, and growth recommendations.
              </p>
              <div className="space-y-3">
                <Link
                  href="/sign-up"
                  className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition"
                >
                  Unlock with 10 Credits
                </Link>
                <Link
                  href="/sign-up"
                  className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
                >
                  Sign Up Free — Get 100 Credits →
                </Link>
              </div>
            </div>
          </div>

          {/* Blurred Content */}
          <div className="space-y-4 blur-sm select-none pointer-events-none">
            {lockedInsights.map((insight) => (
              <div
                key={insight.type}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 opacity-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <h3 className="text-white font-semibold">{insight.title}</h3>
                </div>
                <p className="text-slate-400 text-sm">{insight.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-3">
            Want the Complete Picture?
          </h3>
          <p className="text-slate-400 mb-6">
            Sign up free and get 100 credits to unlock all insights plus access 
            our full suite of AI marketing tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
