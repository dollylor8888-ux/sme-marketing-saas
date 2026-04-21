"use client";

import { useAuth } from "@clerk/react";
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

export default function SeoClient() {
  const { getToken } = useAuth();
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
      const token = await getToken();
      const res = await fetch("/api/actions/ai-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ task, content, title, targetKeyword, url, language }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result || data.seo);
      }
    } catch {
      setError("Failed to generate SEO content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm">A</div>
            <span className="text-white font-semibold">Arclion</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
              <Coins className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-medium">10 credits</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">AI SEO</h1>
        <p className="text-slate-400 mb-8">Optimize your content for AI search engines like Perplexity and ChatGPT</p>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
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
                        : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="mr-2">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Target Keyword (optional)</label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g., wireless earbuds review"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Content to Optimize</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Paste your content here..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                "Generate SEO Content"
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-8">
              <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl min-h-[400px]">
                <h3 className="text-slate-300 font-medium mb-4">Generated Result</h3>
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
      </main>
    </div>
  );
}
