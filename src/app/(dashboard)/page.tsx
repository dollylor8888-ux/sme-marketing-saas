import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCreditBalance } from "@/lib/billing/credit-system";
import prisma from "@/lib/db/prisma";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  const balance = user ? await getCreditBalance(user.id) : 0;

  // Get recent action count
  const actionCount = user
    ? await prisma.actionLog.count({ where: { userId: user.id } })
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-slate-400 text-sm mb-1">Credit Balance</div>
          <div className="text-4xl font-bold text-white">{balance}</div>
          <div className="text-cyan-400 text-sm mt-2">credits available</div>
        </div>
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-slate-400 text-sm mb-1">Actions Used</div>
          <div className="text-4xl font-bold text-white">{actionCount}</div>
          <div className="text-slate-400 text-sm mt-2">total actions</div>
        </div>
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-slate-400 text-sm mb-1">This Month</div>
          <div className="text-4xl font-bold text-white">—</div>
          <div className="text-slate-400 text-sm mt-2">no data yet</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <a
          href="/dashboard/copywriting"
          className="p-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl hover:border-cyan-500/50 transition"
        >
          <div className="text-4xl mb-4">✍️</div>
          <h2 className="text-xl font-bold text-white mb-2">Copywriting</h2>
          <p className="text-slate-400">Generate ad copy, emails, social posts, and more</p>
        </a>
        <a
          href="/dashboard/seo"
          className="p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-500/50 transition"
        >
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">AI SEO</h2>
          <p className="text-slate-400">Optimize content for AI search engines</p>
        </a>
      </div>
    </div>
  );
}
