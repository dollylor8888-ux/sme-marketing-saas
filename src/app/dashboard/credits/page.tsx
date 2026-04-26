"use client";

import { useState, useEffect } from "react";
import { Coins, Loader2, Check, Gift, Users, Copy, Share2, TrendingUp } from "lucide-react";

const CREDIT_PACKAGES = [
  { credits: 100, price: 5, label: "Starter Pack" },
  { credits: 500, price: 20, label: "Value Pack" },
  { credits: 1000, price: 35, label: "Pro Pack" },
];

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingCommissions: number;
}

export default function CreditsPage() {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyingCode, setApplyingCode] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralMessage, setReferralMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [creditsRes, referralRes] = await Promise.all([
        fetch("/api/credits"),
        fetch("/api/referrals"),
      ]);

      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setBalance(data.balance);
      }

      if (referralRes.ok) {
        const data = await referralRes.json();
        setReferralStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    setPurchasing(pkg.label);
    // Stripe integration would go here
    await new Promise((r) => setTimeout(r, 1500));
    setPurchased(pkg.label);
    setPurchasing(null);
    setTimeout(() => setPurchased(null), 3000);
    fetchData();
  };

  const copyReferralCode = async () => {
    if (!referralStats?.referralCode) return;
    await navigator.clipboard.writeText(referralStats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (!referralStats?.referralCode) return;
    const text = `Join me on this amazing AI marketing platform! Use my referral code ${referralStats.referralCode} to get started with bonus credits.`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) return;

    setApplyingCode(true);
    setReferralMessage(null);

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: referralInput }),
      });

      const data = await res.json();

      if (res.ok) {
        setReferralMessage({ type: "success", text: data.message || "Referral code applied successfully!" });
        setReferralInput("");
        fetchData();
      } else {
        setReferralMessage({ type: "error", text: data.error || "Invalid referral code" });
      }
    } catch {
      setReferralMessage({ type: "error", text: "Failed to apply referral code" });
    } finally {
      setApplyingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

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
            <div className="text-3xl font-bold text-white">
              {balance !== null ? `${balance.toLocaleString()} credits` : "—"}
            </div>
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

      {/* Referral Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Invite Friends & Earn Credits</h2>
            <p className="text-slate-400 text-sm">Share your code, earn credits when friends sign up and purchase</p>
          </div>
        </div>

        {/* Referral Stats */}
        {referralStats && (
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Users className="w-4 h-4" />
                Friends Invited
              </div>
              <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Total Earnings
              </div>
              <div className="text-2xl font-bold text-green-400">{referralStats.totalEarnings} credits</div>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Gift className="w-4 h-4" />
                Sign-up Bonus
              </div>
              <div className="text-2xl font-bold text-white">+20 credits</div>
              <div className="text-slate-500 text-xs">per friend who joins</div>
            </div>
          </div>
        )}

        {/* Your Referral Code */}
        {referralStats && (
          <div className="p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl mb-6">
            <div className="text-slate-400 text-sm mb-2">Your Referral Code</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-mono font-bold text-white tracking-wider">
                {referralStats.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-300" />
                )}
              </button>
              <button
                onClick={shareReferral}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="mt-3 text-slate-400 text-sm">
              Earn <span className="text-green-400 font-semibold">+20 credits</span> when friends sign up with your code, plus{" "}
              <span className="text-green-400 font-semibold">10% commission</span> on their first credit purchase!
            </div>
          </div>
        )}

        {/* Apply Referral Code */}
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-1">Have a referral code?</h3>
          <p className="text-slate-400 text-sm mb-4">Enter a friend&apos;s code to get bonus credits</p>
          <form onSubmit={applyReferralCode} className="flex gap-3">
            <input
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={applyingCode || !referralInput.trim()}
              className="px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              {applyingCode ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Code"
              )}
            </button>
          </form>
          {referralMessage && (
            <div
              className={`mt-3 text-sm ${referralMessage.type === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {referralMessage.text}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <p className="text-slate-400 text-sm">
          💡 <strong className="text-white">Pro tip:</strong> Credits never expire. Buy once, use anytime. Share your code
          to earn free credits!
        </p>
      </div>
    </div>
  );
}
