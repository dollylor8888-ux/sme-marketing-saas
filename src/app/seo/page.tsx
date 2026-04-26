"use client";

import Header from "@/components/Header";
import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type SeoTask = "optimize_content" | "meta_tags" | "schema_markup" | "keyword_research" | "content_audit";

const SEO_TASKS: { value: SeoTask; label: string; icon: string }[] = [
  { value: "optimize_content", label: "Optimize Content", icon: "📝" },
  { value: "meta_tags", label: "Meta Tags", icon: "🏷️" },
  { value: "schema_markup", label: "Schema Markup", icon: "📋" },
  { value: "keyword_research", label: "Keyword Research", icon: "🔑" },
  { value: "content_audit", label: "Content Audit", icon: "🔍" },
];

const LANGUAGES = ["English", "Traditional Chinese", "Simplified Chinese", "Cantonese"];

export default function SeoPage() {
  const [task, setTask] = useState<SeoTask>("optimize_content");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("English");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/actions/ai-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, content, language, targetKeyword }),
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
        setResult(data.result || data.content || JSON.stringify(data, null, 2));
      }
    } catch {
      setError("Failed to generate SEO content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI SEO</h1>
          <p className="text-slate-400">Optimize your content for AI search engines like Perplexity and ChatGPT</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Task Type */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">SEO Task</label>
              <div className="grid grid-cols-2 gap-2">
                {SEO_TASKS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTask(t.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      task === t.value
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

            {/* Target Keyword */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Target Keyword (optional)</label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g., wireless earbuds review"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Language */}
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

            {/* Content */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {task === "keyword_research" ? "Seed Keywords / Topic" : "Content to Optimize"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  task === "keyword_research"
                    ? "Enter a seed keyword or topic..."
                    : "Paste your content here..."
                }
                rows={8}
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
                <>Generate SEO Content</>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <Link
                  href="/sign-in?redirect_url=/seo"
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
                <h3 className="text-slate-300 font-medium mb-4">Generated Result</h3>
                {result ? (
                  <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed overflow-auto">
                    {result}
                  </pre>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🔍</div>
                      <p>Your SEO results will appear here</p>
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
