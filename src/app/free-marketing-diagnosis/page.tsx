"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FreeMarketingDiagnosis() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    // Navigate to result page with URL param
    setTimeout(() => {
      router.push(`/free-marketing-diagnosis/result?url=${encodeURIComponent(url)}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-400 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Free Brand Analysis
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Get Your Free
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Brand Diagnosis
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Enter your product URL and get an instant AI-powered marketing analysis.
            <br />
            <span className="text-slate-300">See your strengths, gaps, and opportunities — in 30 seconds.</span>
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleAnalyze} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-store.com/product"
                required
                className="flex-1 px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze Now — Free"}
              </button>
            </div>
            <p className="text-slate-500 text-sm mt-3">
              No signup required • Instant results • 100% free
            </p>
          </form>
        </div>

        {/* What You Get Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What Your Diagnosis Includes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                title: "Brand Positioning",
                desc: "Understand how customers perceive your brand vs competitors",
                color: "cyan"
              },
              {
                icon: "📝",
                title: "Content Gaps",
                desc: "Discover what content you&apos;re missing that competitors have",
                color: "blue"
              },
              {
                icon: "🎯",
                title: "Marketing Opportunities",
                desc: "AI identifies untapped audience segments and channels",
                color: "purple"
              },
              {
                icon: "💰",
                title: "Pricing Insights",
                desc: "See how your pricing compares to market standards",
                color: "green"
              },
              {
                icon: "📱",
                title: "Digital Footprint",
                desc: "Analysis of your SEO, social presence, and visibility",
                color: "orange"
              },
              {
                icon: "🚀",
                title: "Growth Recommendations",
                desc: "Get actionable steps to improve your marketing today",
                color: "pink"
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
              <div className="text-slate-400 text-sm">Websites Analyzed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-slate-400 text-sm">User Rating</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">&lt;30s</div>
              <div className="text-slate-400 text-sm">Analysis Time</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
              <div className="text-slate-400 text-sm">Free to Try</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Know Your Brand&apos;s Score?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of SME owners who use Arclion to understand their market position.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition shadow-lg shadow-cyan-500/25"
          >
            Get Started Free — 100 Credits
          </Link>
        </div>
      </main>
    </div>
  );
}
