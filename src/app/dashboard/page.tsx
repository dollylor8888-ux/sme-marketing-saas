import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCreditBalance } from "@/lib/billing/credit-system";
import { prisma } from "@/lib/billing/credit-system";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  const balance = user ? await getCreditBalance(user.id) : 0;

  const actionCount = user
    ? await prisma.actionLog.count({ where: { userId: user.id } })
    : 0;

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6 lg:mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="p-4 lg:p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-slate-400 text-sm mb-1">Credit Balance</div>
          <div className="text-3xl lg:text-4xl font-bold text-white">{balance}</div>
          <div className="text-cyan-400 text-sm mt-2">credits available</div>
        </div>
        <div className="p-4 lg:p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-slate-400 text-sm mb-1">Actions Used</div>
          <div className="text-3xl lg:text-4xl font-bold text-white">{actionCount}</div>
          <div className="text-slate-400 text-sm mt-2">total actions</div>
        </div>
        <div className="p-4 lg:p-6 bg-slate-800 border border-slate-700 rounded-xl sm:col-span-2 lg:col-span-1">
          <div className="text-slate-400 text-sm mb-1">This Month</div>
          <div className="text-3xl lg:text-4xl font-bold text-white">—</div>
          <div className="text-slate-400 text-sm mt-2">no data yet</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <Link
          href="/dashboard/copywriting"
          className="p-5 lg:p-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl hover:border-cyan-500/50 transition"
        >
          <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">✍️</div>
          <h2 className="text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2">Copywriting</h2>
          <p className="text-slate-400 text-sm">Generate ad copy, emails, social posts, and more</p>
        </Link>
        <Link
          href="/dashboard/seo"
          className="p-5 lg:p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-500/50 transition"
        >
          <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">🔍</div>
          <h2 className="text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2">AI SEO</h2>
          <p className="text-slate-400 text-sm">Optimize content for AI search engines</p>
        </Link>
        <Link
          href="/dashboard/product-marketing"
          className="p-5 lg:p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition"
        >
          <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">🚀</div>
          <h2 className="text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2">Product Marketing</h2>
          <p className="text-slate-400 text-sm">AI product analysis to ad campaigns</p>
        </Link>
        <Link
          href="/dashboard/history"
          className="p-5 lg:p-8 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl hover:border-orange-500/50 transition"
        >
          <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">📜</div>
          <h2 className="text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2">History</h2>
          <p className="text-slate-400 text-sm">Review and rate past generations</p>
        </Link>
      </div>
    </div>
  );
}
