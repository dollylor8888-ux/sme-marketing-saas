/**
 * Boss Admin Dashboard — Token costs & margins (hidden from users)
 * Access: requires x-boss-key header
 */

"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Coins, Cpu, BarChart3, DollarSign } from "lucide-react";

interface MarginSummary {
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  totalTokens: number;
  actionCount: number;
  bySkill: Record<string, { count: number; revenue: number; cost: number; margin: number }>;
}

interface DailySummary {
  date: string;
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  totalTokens: number;
  actionCount: number;
}

const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "claude-3-5-sonnet": { input: 3.0, output: 15.0 },
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function BossDashboard() {
  const [summary, setSummary] = useState<MarginSummary | null>(null);
  const [daily, setDaily] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = prompt("Enter Boss Secret Key:");
    if (!key) {
      setError("Access denied");
      setLoading(false);
      return;
    }

    fetch("/api/boss/margin-summary", {
      headers: { "x-boss-key": key },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Invalid key or server error");
        return r.json();
      })
      .then((data) => {
        setSummary(data.summary);
        setDaily(data.daily ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!summary) return null;

  const marginPercent = summary.totalRevenue > 0
    ? ((summary.totalMargin / summary.totalRevenue) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Boss Dashboard</h1>
              <p className="text-xs text-slate-400">Token Costs & Margins — Hidden from Users</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-xs text-slate-400">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Admin Only
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{formatCurrency(summary.totalRevenue)}</div>
            <div className="text-xs text-slate-500 mt-1">{summary.actionCount} actions</div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total API Cost</span>
              <Cpu className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">{formatCurrency(summary.totalCost)}</div>
            <div className="text-xs text-slate-500 mt-1">{formatNumber(summary.totalTokens)} tokens</div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Margin</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400">{formatCurrency(summary.totalMargin)}</div>
            <div className="text-xs text-slate-500 mt-1">Profit</div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Margin %</span>
              <BarChart3 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400">{marginPercent}%</div>
            <div className="text-xs text-slate-500 mt-1">Net profit rate</div>
          </div>
        </div>

        {/* By Skill Breakdown */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">By Skill</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summary.bySkill).map(([skill, data]) => {
              const marginPct = data.revenue > 0 ? ((data.margin / data.revenue) * 100).toFixed(1) : "0";
              return (
                <div key={skill} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold capitalize">{skill.replace("-", " ")}</span>
                    <span className="text-xs text-slate-400">{data.count} calls</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Revenue</span>
                      <span className="text-green-400">{formatCurrency(data.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">API Cost</span>
                      <span className="text-red-400">{formatCurrency(data.cost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                      <span className="text-slate-300 font-medium">Margin</span>
                      <span className="text-cyan-400 font-bold">{formatCurrency(data.margin)} ({marginPct}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Trend */}
        {daily.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Daily Trend</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                    <th className="text-right py-3 px-4">Tokens</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Cost</th>
                    <th className="text-right py-3 px-4">Margin</th>
                    <th className="text-right py-3 px-4">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((d) => {
                    const pct = d.totalRevenue > 0 ? ((d.totalMargin / d.totalRevenue) * 100).toFixed(1) : "0";
                    return (
                      <tr key={d.date} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                        <td className="py-3 px-4">{d.date}</td>
                        <td className="text-right py-3 px-4 text-slate-300">{d.actionCount}</td>
                        <td className="text-right py-3 px-4 text-slate-400">{formatNumber(d.totalTokens)}</td>
                        <td className="text-right py-3 px-4 text-green-400">{formatCurrency(d.totalRevenue)}</td>
                        <td className="text-right py-3 px-4 text-red-400">{formatCurrency(d.totalCost)}</td>
                        <td className="text-right py-3 px-4 text-cyan-400 font-medium">{formatCurrency(d.totalMargin)}</td>
                        <td className={`text-right py-3 px-4 font-medium ${parseFloat(pct) > 50 ? "text-green-400" : "text-amber-400"}`}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Model Pricing Reference */}
        <div>
          <h2 className="text-xl font-bold mb-4">Model Pricing (per 1M tokens)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(MODEL_PRICES).map(([model, prices]) => (
              <div key={model} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="font-medium mb-2">{model}</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Input</span>
                    <span className="text-red-400">${prices.input}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Output</span>
                    <span className="text-red-400">${prices.output}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
