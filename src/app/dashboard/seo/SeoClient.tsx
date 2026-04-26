"use client";

import { useState } from "react";
import { useAuth } from "@clerk/react";
import { Loader2, Copy, Check, Lightbulb } from "lucide-react";

type SeoTask = "optimize_content" | "meta_tags" | "schema_markup" | "keyword_research" | "content_audit";

interface TaskOption {
  value: SeoTask;
  label: string;
  icon: string;
  description: string;
  credits: number;
}

const SEO_TASKS: TaskOption[] = [
  { value: "optimize_content", label: "Content Optimization", icon: "📝", description: "Optimize existing content for AI search", credits: 15 },
  { value: "meta_tags", label: "Meta Tags", icon: "🏷️", description: "Generate title, description, OG tags", credits: 10 },
  { value: "schema_markup", label: "Schema Markup", icon: "📋", description: "Generate structured data code", credits: 15 },
  { value: "keyword_research", label: "Keyword Research", icon: "🔍", description: "Find strategic keywords", credits: 10 },
  { value: "content_audit", label: "Content Audit", icon: "📊", description: "Audit existing content for SEO", credits: 20 },
];

const LANGUAGES = ["English", "Traditional Chinese", "Simplified Chinese"];

export default function SeoClient() {
  const { getToken } = useAuth();
  const [task, setTask] = useState<SeoTask>("optimize_content");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ result?: string; suggestions?: string[]; reasoning?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const activeTask = SEO_TASKS.find(t => t.value === task)!;

  const handleGenerate = async () => {
    if (!content && !title && !keyword) {
      setError("Please provide some content, title, or keyword");
      return;
    }

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
        body: JSON.stringify({
          task,
          content: content || undefined,
          title: title || undefined,
          targetKeyword: keyword || undefined,
          url: url || undefined,
          language,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult({
          result: data.result,
          suggestions: data.suggestions,
          reasoning: data.reasoning,
        });
      }
    } catch {
      setError("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">AI SEO</h1>
        <p className="text-slate-400 text-sm lg:text-base">Optimize content for AI search engines</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Task Selection */}
        <div className="xl:col-span-1 space-y-3">
          <h2 className="text-slate-400 text-sm font-medium mb-3">Select Task</h2>
          {SEO_TASKS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTask(t.value)}
              className={`w-full p-4 rounded-xl border text-left transition ${
                task === t.value
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{t.icon}</span>
                <div>
                  <div className="text-white font-medium text-sm lg:text-base">{t.label}</div>
                  <div className="text-slate-400 text-xs mt-1 hidden sm:block">{t.description}</div>
                  <div className="text-cyan-400 text-xs mt-1">{t.credits} credits</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT: Input + Output */}
        <div className="xl:col-span-2 space-y-6">
          {/* Input Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6 space-y-4">
            <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
              <span>📝</span> Input Details
            </h2>

            {(task === "optimize_content" || task === "content_audit") && (
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Paste your content here..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>
            )}

            {(task === "meta_tags" || task === "keyword_research") && (
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Page Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Best Wireless Earbuds 2024"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>
            )}

            {task !== "schema_markup" && (
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Target Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., wireless earbuds"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>
            )}

            {task === "schema_markup" && (
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Page URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 lg:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate ({activeTask.credits} credits)</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
              <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                <span>✨</span> SEO Output
              </h2>

              {result.result && (
                <div>
                  <div className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Result
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 lg:p-4 relative group">
                    <p className="text-white text-sm lg:text-base whitespace-pre-wrap">{result.result}</p>
                    <button
                      onClick={() => copyToClipboard(result.result!, "result")}
                      className="absolute top-2 lg:top-3 right-2 lg:right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      {copied === "result" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">Suggestions</div>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-start gap-2">
                        <span className="text-cyan-400 flex-shrink-0">•</span>
                        <p className="text-slate-300 text-sm">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.reasoning && (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 lg:p-4">
                  <div className="text-sm text-cyan-400 mb-2 font-medium">Why</div>
                  <p className="text-slate-300 text-sm">{result.reasoning}</p>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm lg:text-base">
              <span>💡</span> AI SEO Tips
            </h3>
            <ul className="text-slate-400 text-xs lg:text-sm space-y-1.5">
              <li>• AI search engines favor clear structure with headers</li>
              <li>• Include specific facts, numbers, and dates</li>
              <li>• Answer questions directly and completely</li>
              <li>• Use schema markup for rich results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
