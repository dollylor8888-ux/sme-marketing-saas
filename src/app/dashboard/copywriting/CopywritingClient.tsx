"use client";

import { useAuth } from "@clerk/react";
import { useState } from "react";
import { Loader2, Copy, Check, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

type CopyType =
  // Headlines
  | "hook_statement"
  | "headline_outcome"
  | "headline_problem"
  | "headline_question"
  | "headline_differentiation"
  | "headline_social_proof"
  // CTA
  | "cta_primary"
  | "cta_secondary"
  | "cta_urgency"
  | "cta_objection_handling"
  // Page
  | "hero_section"
  | "landing_page"
  | "about_story"
  | "pricing_value"
  | "feature_benefit"
  | "testimonial_intro"
  // Email & Ads
  | "email_subject"
  | "email_body"
  | "ad_facebook"
  | "ad_google"
  | "ad_linkedin"
  // Product
  | "product_description"
  | "product_benefits"
  | "use_case_narrative";

type Category = "headlines" | "cta" | "page" | "email_ads" | "product";

interface CopyTypeOption {
  value: CopyType;
  label: string;
  icon: string;
  description: string;
  characterLimit?: string;
}

const COPY_TYPE_GROUPS: { category: Category; label: string; icon: string; types: CopyTypeOption[] }[] = [
  {
    category: "headlines",
    label: "Headlines",
    icon: "📣",
    types: [
      { value: "hook_statement", label: "Hook Statement", icon: "⚡", description: "Attention-grabbing opening", characterLimit: "30" },
      { value: "headline_outcome", label: "Outcome Headline", icon: "🎯", description: "Promise a specific result", characterLimit: "60" },
      { value: "headline_problem", label: "Problem Headline", icon: "💔", description: "Highlight their pain point", characterLimit: "60" },
      { value: "headline_question", label: "Question Headline", icon: "❓", description: "Ask what they want to know", characterLimit: "60" },
      { value: "headline_differentiation", label: "Differentiation", icon: "🏆", description: "Stand out from competitors", characterLimit: "60" },
      { value: "headline_social_proof", label: "Social Proof", icon: "👥", description: "Use numbers & credibility", characterLimit: "60" },
    ],
  },
  {
    category: "cta",
    label: "Call-to-Action",
    icon: "👆",
    types: [
      { value: "cta_primary", label: "Primary CTA", icon: "🔥", description: "Main action button" },
      { value: "cta_secondary", label: "Secondary CTA", icon: "📎", description: "Softer commitment option" },
      { value: "cta_urgency", label: "Urgency CTA", icon: "⏰", description: "Time-sensitive motivation" },
      { value: "cta_objection_handling", label: "Objection Handling", icon: "🤝", description: "Address hesitations" },
    ],
  },
  {
    category: "page",
    label: "Page Copy",
    icon: "📄",
    types: [
      { value: "hero_section", label: "Hero Section", icon: "🚀", description: "Headline + Subheadline + CTA" },
      { value: "landing_page", label: "Landing Page", icon: "🏝️", description: "Complete landing page" },
      { value: "about_story", label: "About Story", icon: "📖", description: "Brand origin & mission" },
      { value: "pricing_value", label: "Pricing Value", icon: "💎", description: "Help choose the right plan" },
      { value: "feature_benefit", label: "Feature → Benefit", icon: "⚙️", description: "Connect features to outcomes" },
      { value: "testimonial_intro", label: "Testimonial Format", icon: "💬", description: "Format testimonials for impact" },
    ],
  },
  {
    category: "email_ads",
    label: "Email & Ads",
    icon: "📧",
    types: [
      { value: "email_subject", label: "Email Subject", icon: "📬", description: "Maximize open rates" },
      { value: "email_body", label: "Email Body", icon: "📝", description: "Full email with hook + CTA" },
      { value: "ad_facebook", label: "Facebook/IG Ad", icon: "📘", description: "Meta platform ad copy" },
      { value: "ad_google", label: "Google Ads", icon: "🔍", description: "Headlines + descriptions" },
      { value: "ad_linkedin", label: "LinkedIn Ad", icon: "💼", description: "B2B professional ads" },
    ],
  },
  {
    category: "product",
    label: "Product",
    icon: "📦",
    types: [
      { value: "product_description", label: "Product Description", icon: "📋", description: "Compelling description" },
      { value: "product_benefits", label: "Benefits List", icon: "✨", description: "5-7 benefit statements" },
      { value: "use_case_narrative", label: "Use Case Story", icon: "🎬", description: "Real-life scenario" },
    ],
  },
];

const LANGUAGES = ["English", "Traditional Chinese", "Simplified Chinese", "Cantonese"];
const TONES = ["Professional", "Friendly", "Casual", "Luxury", "Urgent", "Playful", "Bold", "Witty"];

// Fine-tune options
type LengthOption = "shorter" | "same" | "longer";
type ToneOption = "professional" | "casual" | "bold" | "reserved";
type FocusOption = "value" | "quality" | "emotion" | "urgency";
type FormatOption = "same" | "bullet" | "paragraph" | "conversational";

interface FineTuneState {
  enabled: boolean;
  length: LengthOption;
  tone: ToneOption;
  focus: FocusOption;
  format: FormatOption;
  language: string;
  customInstruction: string;
}

export default function CopywritingClient() {
  const { getToken } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>("headlines");
  const [type, setType] = useState<CopyType>("hook_statement");
  const [product, setProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ primary?: string; variants?: string[]; reasoning?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showFineTune, setShowFineTune] = useState(false);
  const [fineTune, setFineTune] = useState<FineTuneState>({
    enabled: false,
    length: "same",
    tone: "professional",
    focus: "value",
    format: "same",
    language: "",
    customInstruction: "",
  });

  const activeGroup = COPY_TYPE_GROUPS.find((g) => g.category === activeCategory);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const payload: Record<string, unknown> = { type, product, brand, audience, tone, language, extra };

      // Include fine-tune params only if enabled and we have a previous result
      if (fineTune.enabled && result) {
        payload.fineTune = {
          length: fineTune.length === "same" ? undefined : fineTune.length,
          tone: fineTune.tone === "professional" ? undefined : fineTune.tone,
          focus: fineTune.focus === "value" ? undefined : fineTune.focus,
          format: fineTune.format === "same" ? undefined : fineTune.format,
          language: fineTune.language || undefined,
          customInstruction: fineTune.customInstruction || undefined,
        };
        payload.previousOutput = result.primary || result.variants?.[0] || "";
      }

      const res = await fetch("/api/actions/copywriting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to generate copy. Please try again.");
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Copywriting</h1>
        <p className="text-slate-400 text-sm lg:text-base">20+ copy types powered by marketingskills frameworks</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Type Selection - Full width on mobile, 1/3 on xl */}
        <div className="xl:col-span-1 space-y-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COPY_TYPE_GROUPS.map((group) => (
              <button
                key={group.category}
                onClick={() => setActiveCategory(group.category)}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition flex items-center gap-1 ${
                  activeCategory === group.category
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{group.icon}</span>
                <span className="hidden sm:inline">{group.label}</span>
              </button>
            ))}
          </div>

          {/* Type options */}
          <div className="space-y-2">
            {activeGroup?.types.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`w-full p-3 lg:p-4 rounded-lg border text-left transition ${
                  type === t.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg lg:text-xl">{t.icon}</span>
                  <div>
                    <div className="font-medium text-sm lg:text-base">{t.label}</div>
                    <div className="text-xs text-slate-500 mt-1 hidden sm:block">{t.description}</div>
                    {t.characterLimit && (
                      <div className="text-xs text-slate-600 mt-1">Max {t.characterLimit} chars</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Input + Output - Full width on mobile, 2/3 on xl */}
        <div className="xl:col-span-2 space-y-6">
          {/* Input Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6 space-y-4">
            <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
              <span>📝</span> Input Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Product</label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g., Wireless Earbuds"
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., SoundPro"
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., Young professionals 25-35"
                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Additional Context</label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={2}
                placeholder="Any specific requirements..."
                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
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
                  <span>Generate Copy</span>
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

          {/* Fine-tune Panel — only shown when result exists */}
          {result && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              {/* Toggle Header */}
              <button
                onClick={() => setShowFineTune(!showFineTune)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-300 hover:bg-slate-700/30 transition"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  ✏️ Fine-tune Output
                  {fineTune.enabled && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      Active
                    </span>
                  )}
                </span>
                {showFineTune ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Fine-tune Options */}
              {showFineTune && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-700">
                  {/* Enable Toggle */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => setFineTune({ ...fineTune, enabled: !fineTune.enabled })}
                      className={`w-10 h-6 rounded-full transition flex items-center ${
                        fineTune.enabled ? "bg-cyan-500" : "bg-slate-600"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full mx-1 transition ${
                        fineTune.enabled ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                    <span className="text-sm text-slate-300">Enable Fine-tune Mode</span>
                  </div>

                  {fineTune.enabled && (
                    <>
                      {/* Row 1: Length + Tone */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 text-xs mb-1.5">Length</label>
                          <div className="flex gap-1">
                            {(["shorter", "same", "longer"] as LengthOption[]).map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setFineTune({ ...fineTune, length: opt })}
                                className={`flex-1 py-1.5 rounded text-xs transition ${
                                  fineTune.length === opt
                                    ? "bg-cyan-500 text-white"
                                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                }`}
                              >
                                {opt === "shorter" ? "短" : opt === "longer" ? "長" : "不變"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs mb-1.5">Tone</label>
                          <select
                            value={fineTune.tone}
                            onChange={(e) => setFineTune({ ...fineTune, tone: e.target.value as ToneOption })}
                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="bold">Bold</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Focus + Format */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 text-xs mb-1.5">Focus</label>
                          <select
                            value={fineTune.focus}
                            onChange={(e) => setFineTune({ ...fineTune, focus: e.target.value as FocusOption })}
                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                          >
                            <option value="value">性價比</option>
                            <option value="quality">品質</option>
                            <option value="emotion">情感</option>
                            <option value="urgency">緊迫感</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs mb-1.5">Format</label>
                          <select
                            value={fineTune.format}
                            onChange={(e) => setFineTune({ ...fineTune, format: e.target.value as FormatOption })}
                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                          >
                            <option value="same">不變</option>
                            <option value="bullet">Bullet Points</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="conversational">Conversational</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Language */}
                      <div>
                        <label className="block text-slate-400 text-xs mb-1.5">Translate to</label>
                        <select
                          value={fineTune.language}
                          onChange={(e) => setFineTune({ ...fineTune, language: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                        >
                          <option value="">不翻譯</option>
                          <option value="English">English</option>
                          <option value="Traditional Chinese">繁體中文</option>
                          <option value="Simplified Chinese">簡體中文</option>
                          <option value="Cantonese">廣東話</option>
                        </select>
                      </div>

                      {/* Row 4: Custom Instruction */}
                      <div>
                        <label className="block text-slate-400 text-xs mb-1.5">Custom Instruction</label>
                        <textarea
                          value={fineTune.customInstruction}
                          onChange={(e) => setFineTune({ ...fineTune, customInstruction: e.target.value })}
                          rows={2}
                          placeholder="e.g., Make it more punchy, add emoji, emphasize the discount..."
                          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 text-xs resize-none"
                        />
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adjusting...</>
                        ) : (
                          <><SlidersHorizontal className="w-3.5 h-3.5" /> Apply Fine-tune</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
              <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                <span>✨</span> Generated Copy
              </h2>

              {/* Primary */}
              {result.primary && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">Primary (Best Option)</div>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 lg:p-4 relative group">
                    <p className="text-white text-base lg:text-lg pr-12">{result.primary}</p>
                    <button
                      onClick={() => copyToClipboard(result.primary!, "primary")}
                      className="absolute top-2 lg:top-3 right-2 lg:right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      {copied === "primary" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Variants */}
              {result.variants && result.variants.length > 0 && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">Alternatives</div>
                  <div className="space-y-2">
                    {result.variants.map((variant, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 lg:p-4 relative group">
                        <div className="text-xs text-slate-500 mb-1">#{i + 2}</div>
                        <p className="text-slate-300 text-sm lg:text-base">{variant}</p>
                        <button
                          onClick={() => copyToClipboard(variant, `variant-${i}`)}
                          className="absolute top-2 lg:top-3 right-2 lg:right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition"
                        >
                          {copied === `variant-${i}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {result.reasoning && (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 lg:p-4">
                  <div className="text-sm text-cyan-400 mb-2 font-medium">Why this works</div>
                  <p className="text-slate-300 text-sm">{result.reasoning}</p>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm lg:text-base">
              <span>💡</span> Tips for Better Copy
            </h3>
            <ul className="text-slate-400 text-xs lg:text-sm space-y-1.5">
              <li>• Be specific — &quot;Save 5 hours&quot; beats &quot;save time&quot;</li>
              <li>• Lead with benefits, not features</li>
              <li>• Use customer language, not company speak</li>
              <li>• Test multiple variants to find what resonates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
