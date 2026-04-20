"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";

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
  const [title, setTitle] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
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
        body: JSON.stringify({ task, content, title, targetKeyword, url, language }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Failed to optimize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">AI SEO</h1>
          <p className="text-slate-400 mt-1">Optimize content for AI search engines</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
          <Coins className="w-4 h-4 text-green-400" />
          <span className="text-white font-medium">15 credits</span>
          <span className="text-slate-400 text-sm">per action</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          {/* Task Type */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">SEO Task</label>
            <div className="grid grid-cols-1 gap-2">
              {SEO_TASKS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTask(t.value)}
                  className={`p-3 rounded-lg border text-left transition ${
                    task === t.value
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className="mr-2">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Title / Topic</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Best Wireless Earbuds 2024"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">URL (for meta tags/schema)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/blog/post"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Target Keyword */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Target Keyword</label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g., wireless earbuds"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Content (for optimize/audit) */}
          {(task === "optimize_content" || task === "content_audit") && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Content to Optimize</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 resize-none"
              />
            </div>
          )}

          {/* Language */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>Run SEO Analysis</>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        <div>
          <div className="sticky top-8">
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl min-h-[400px]">
              <h3 className="text-slate-300 font-medium mb-4">SEO Recommendations</h3>
              {result ? (
                <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {result}
                </pre>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <p>Your SEO recommendations will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
