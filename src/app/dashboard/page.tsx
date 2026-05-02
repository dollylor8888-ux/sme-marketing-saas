import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Circle,
  ClipboardList,
  CreditCard,
  FileText,
  LineChart,
  Rocket,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { ensureUser, getCreditBalance } from "@/lib/billing/credit-system";
import { prisma } from "@/lib/billing/credit-system";

export const dynamic = "force-dynamic";

const PIPELINE_STEPS = [
  {
    title: "Diagnose",
    detail: "Product URL, positioning, audience, offer angle",
    href: "/free-marketing-diagnosis",
    icon: ClipboardList,
  },
  {
    title: "Build",
    detail: "Selling points, Meta/IG ad sets, HKD budget",
    href: "/dashboard/product-marketing",
    icon: Target,
  },
  {
    title: "Create",
    detail: "Traditional Chinese and Hong Kong-style ad copy",
    href: "/dashboard/product-marketing",
    icon: FileText,
  },
  {
    title: "Review",
    detail: "Upload CSV, find winners, plan next actions",
    href: "/dashboard/product-marketing",
    icon: LineChart,
  },
];

const NEXT_ACTIONS = [
  {
    title: "Start a product campaign",
    detail: "Best first step for ecommerce, retail, F&B, and service offers.",
    href: "/dashboard/product-marketing",
    cta: "Open Campaign Studio",
    icon: Rocket,
  },
  {
    title: "Set your brand memory",
    detail: "Keep tone, offer, audience, and avoid-words consistent.",
    href: "/dashboard/settings/memory",
    cta: "Update Memory",
    icon: Sparkles,
  },
  {
    title: "Review previous outputs",
    detail: "Mark useful generations so the next campaign can improve.",
    href: "/dashboard/history",
    cta: "View History",
    icon: CheckCircle2,
  },
];

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await ensureUser(clerkId);
  const [balance, actionCount, workspaceCount, campaignCount, performanceRows] = await Promise.all([
    getCreditBalance(user.id),
    prisma.actionLog.count({ where: { userId: user.id } }),
    prisma.workspace.count({ where: { userId: user.id } }),
    prisma.campaign.count({ where: { workspace: { userId: user.id } } }),
    prisma.campaignPerformance.count({ where: { workspace: { userId: user.id } } }),
  ]);

  return (
    <div className="space-y-8">
      <section className="border border-slate-700 bg-slate-800/60 rounded-xl p-5 lg:p-8">
        <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Campaign workspace
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-3">
              Build the next campaign from one product URL.
            </h1>
            <p className="text-slate-400 max-w-2xl">
              Product insight, Hong Kong audience angles, Meta/Instagram structure, copy,
              and performance review now sit in one flow.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/product-marketing"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition"
            >
              New Campaign
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/free-marketing-diagnosis"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
            >
              Free Diagnosis
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Credits", value: balance.toLocaleString(), detail: "available", icon: CreditCard },
          { label: "Actions", value: actionCount.toLocaleString(), detail: "used", icon: BarChart3 },
          { label: "Workspaces", value: workspaceCount.toLocaleString(), detail: "brands", icon: Target },
          { label: "Campaigns", value: campaignCount.toLocaleString(), detail: "created", icon: Rocket },
          { label: "Rows", value: performanceRows.toLocaleString(), detail: "performance data", icon: Upload },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-400 text-sm">{stat.label}</div>
                <Icon className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-500 text-sm mt-1">{stat.detail}</div>
            </div>
          );
        })}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Campaign Pipeline</h2>
            <p className="text-slate-400 text-sm mt-1">The core workflow for the first Hong Kong SME MVP.</p>
          </div>
          <Link
            href="/dashboard/product-marketing"
            className="hidden sm:inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 text-sm font-medium"
          >
            Open Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                href={step.href}
                className="p-5 bg-slate-800/70 border border-slate-700 hover:border-cyan-500/40 rounded-xl transition"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="text-slate-500 text-sm">0{index + 1}</div>
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.detail}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid xl:grid-cols-[1fr_0.8fr] gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Next Actions</h2>
          <div className="space-y-3">
            {NEXT_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{action.title}</div>
                    <div className="text-slate-400 text-sm mt-1">{action.detail}</div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-cyan-300 text-sm font-medium">
                    {action.cta}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">What We Keep Simple</h2>
          <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl space-y-4">
            {[
              "One primary campaign flow instead of 36 visible tools",
              "Copywriting and SEO as supporting modules",
              "Credits shown as plan capacity, not technical billing noise",
              "Performance review starts with CSV before Meta API integration",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Circle className="w-4 h-4 text-cyan-300 mt-0.5" />
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
