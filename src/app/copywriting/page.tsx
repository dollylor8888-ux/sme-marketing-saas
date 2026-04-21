"use client";

import Header from "@/components/Header";
import { useState } from "react";
import Link from "next/link";
import { Coins, Loader2, Copy, Check } from "lucide-react";

type CopyType = "ad_headline" | "ad_description" | "email_subject" | "email_body" | "social_post" | "landing_hero" | "product_description";

const COPY_TYPES: { value: CopyType; label: string; icon: string }[] = [
  { value: "ad_headline", label: "Ad Headline", icon: "📣" },
  { value: "ad_description", label: "Ad Description", icon: "📝" },
  { value: "email_subject", label: "Email Subject", icon: "📧" },
  { value: "email_body", label: "Email Body", icon: "📧" },
  { value: "social_post", label: "Social Post", icon: "📱" },
  { value: "landing_hero", label: "Landing Hero", icon: "🚀" },
  { value: "product_description", label: "Product Description", icon: "📦" },
];

const LANGUAGES = ["English", "Traditional Chinese", "Simplified Chinese", "Cantonese"];
const TONES = ["Professional", "Friendly", "Casual", "Luxury", "Urgent", "Playful"];

export default function CopywritingPage() {
  const [type, setType] = useState<CopyType>("ad_headline");
  const [product, setProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/actions/copywriting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, product, brand, audience, tone, language, extra }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.error) {
        if (data.error === "Unauthorized" || data.error === "No auth token provided") {
          setError("Please sign in to use this feature");
        } else {
          setError(data.error);
        }
      } else {
        setResult(data.copy);
      }
    } catch {
      setError("Failed to generate copy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Copywriting</h1>
          <p className="text-slate-400">Generate marketing copy in seconds — ads, emails, social posts, and more</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Copy Type */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">Copy Type</label>
              <div className="grid grid-cols-2 gap-2">
                {COPY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      type === t.value
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="mr-2">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Product (optional)</label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g., Wireless Earbuds"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Brand (optional)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., SoundPro"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Target Audience (optional)</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., Young professionals who commute daily"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Extra Context (optional)</label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Any additional details..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate Copy</>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <Link
                  href="/sign-in?redirect_url=/copywriting"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                >
                  Sign in to continue →
                </Link>
              </div>
            )}
          </div>

          {/* Result */}
          <div>
            <div className="sticky top-8">
              <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-300 font-medium">Generated Copy</h3>
                  {result && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white transition"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  )}
                </div>
                {result ? (
                  <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {result}
                  </pre>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">✍️</div>
                      <p>Your generated copy will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
