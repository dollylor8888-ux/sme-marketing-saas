"use client";

import { useState } from "react";
import { Star, ThumbsUp, RotateCcw, Loader2, ExternalLink } from "lucide-react";

interface HistoryItem {
  id: string;
  type: string;
  product: string;
  brand: string;
  result: string;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    type: "hook_statement",
    product: "Wireless Earbuds",
    brand: "SoundPro",
    result: "Stop losing focus. Get immersed in your music.",
    rating: 5,
    feedback: null,
    createdAt: "2024-01-15 10:30"
  },
  {
    id: "2",
    type: "email_subject",
    product: "Smart Watch",
    brand: "TechTime",
    result: "Your day just got 2 hours back",
    rating: 4,
    feedback: null,
    createdAt: "2024-01-14 15:22"
  },
  {
    id: "3",
    type: "hero_section",
    product: "Running Shoes",
    brand: "SpeedFlex",
    result: "Run longer without the pain",
    rating: null,
    feedback: null,
    createdAt: "2024-01-13 09:45"
  }
];

export default function HistoryClient() {
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  const handleRate = async (id: string, rating: number) => {
    setRatingLoading(id);
    await new Promise(r => setTimeout(r, 500));
    setHistory(history.map(item => 
      item.id === id ? { ...item, rating } : item
    ));
    setRatingLoading(null);
  };

  const renderStars = (currentRating: number | null, itemId: string) => {
    const rating = currentRating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(itemId, star)}
            disabled={ratingLoading === itemId}
            className={`p-1 transition ${
              ratingLoading === itemId ? "opacity-50" : "hover:scale-110"
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-600 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hook_statement: "Hook Statement",
      headline_outcome: "Outcome Headline",
      email_subject: "Email Subject",
      hero_section: "Hero Section",
      landing_page: "Landing Page",
      ad_facebook: "Facebook Ad",
      video_script: "Video Script"
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Generation History</h1>
        <p className="text-slate-400 text-sm lg:text-base">Review and rate your past generations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-white font-medium mb-2">No history yet</h3>
          <p className="text-slate-400 text-sm">Your generated copy will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs lg:text-sm">
                    {item.product} · {item.brand}
                  </div>
                </div>
                <div className="text-slate-500 text-xs">{item.createdAt}</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 lg:p-4 mb-4">
                <p className="text-white text-sm lg:text-base leading-relaxed">
                  {item.result}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-xs">Rating:</span>
                  {renderStars(item.rating, item.id)}
                  {item.rating && (
                    <span className="text-yellow-400 text-xs">
                      {item.rating}/5
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Use Style
                  </button>
                  <button
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </button>
                </div>
              </div>

              {item.feedback && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <ThumbsUp className="w-3 h-3" /> Thanks for your feedback!
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
