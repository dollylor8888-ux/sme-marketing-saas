"use client";

import { useState } from "react";
import { Coins, Loader2, Check } from "lucide-react";

const CREDIT_PACKAGES = [
  { credits: 100, price: 5, label: "Starter Pack" },
  { credits: 500, price: 20, label: "Value Pack" },
  { credits: 1000, price: 35, label: "Pro Pack" },
];

export const dynamic = "force-dynamic";

export default function CreditsPage() {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    setPurchasing(pkg.label);
    // Stripe integration would go here
    // For now, just simulate a purchase
    await new Promise((r) => setTimeout(r, 1500));
    setPurchased(pkg.label);
    setPurchasing(null);
    setTimeout(() => setPurchased(null), 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Credits</h1>
        <p className="text-slate-400">Top up your credits to continue using AI marketing tools</p>
      </div>

      {/* Current Balance */}
      <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-slate-400 text-sm">Current Balance</div>
            <div className="text-3xl font-bold text-white">100 credits</div>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <h2 className="text-xl font-bold text-white mb-4">Buy More Credits</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.label}
            className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition"
          >
            <div className="text-lg font-bold text-white mb-1">{pkg.label}</div>
            <div className="text-3xl font-bold text-cyan-400 mb-4">
              {pkg.credits.toLocaleString()} <span className="text-lg text-slate-400 font-normal">credits</span>
            </div>
            <div className="text-2xl font-bold text-white mb-6">${pkg.price}</div>
            <button
              onClick={() => handlePurchase(pkg)}
              disabled={purchasing === pkg.label || purchased === pkg.label}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-green-500 disabled:cursor-default text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {purchasing === pkg.label ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : purchased === pkg.label ? (
                <>
                  <Check className="w-5 h-5" />
                  Purchased!
                </>
              ) : (
                `Buy ${pkg.label}`
              )}
            </button>
            <div className="text-center text-slate-500 text-xs mt-3">
              ${(pkg.price / pkg.credits).toFixed(3)} per credit
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <p className="text-slate-400 text-sm">
          💡 <strong className="text-white">Pro tip:</strong> Credits never expire. Buy once, use anytime.
        </p>
      </div>
    </div>
  );
}
