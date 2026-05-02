"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Coins,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Menu,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";

const PRIMARY_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/product-marketing", icon: Target, label: "New Campaign" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/credits", icon: CreditCard, label: "Billing" },
];

const TOOLBOX_NAV_ITEMS = [
  { href: "/dashboard/copywriting", icon: FileText, label: "Copywriting" },
  { href: "/dashboard/seo", icon: Search, label: "AI SEO" },
  { href: "/dashboard/settings/memory", icon: Brain, label: "Brand Memory" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

function NavItems({
  items,
  onNavigate,
}: {
  items: typeof PRIMARY_NAV_ITEMS;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              active
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
              A
            </div>
            <span className="text-white font-semibold">Arclion</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 p-4 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          <span className="text-white font-semibold">Arclion</span>
        </div>
        <nav className="p-4 space-y-6">
          <div className="space-y-1">
            <NavItems items={PRIMARY_NAV_ITEMS} onNavigate={() => setSidebarOpen(false)} />
          </div>
          <div>
            <div className="px-3 mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Toolbox
            </div>
            <div className="space-y-1">
              <NavItems items={TOOLBOX_NAV_ITEMS} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4 flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          <span className="text-white font-semibold">Arclion</span>
        </div>
        <nav className="space-y-6 flex-1">
          <div className="space-y-1">
            <NavItems items={PRIMARY_NAV_ITEMS} />
          </div>
          <div>
            <div className="px-3 mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Toolbox
            </div>
            <div className="space-y-1">
              <NavItems items={TOOLBOX_NAV_ITEMS} />
            </div>
          </div>
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-700">
          <Link
            href="/dashboard/product-marketing"
            className="flex items-center gap-3 px-3 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="text-white text-sm font-medium">Campaign Studio</div>
              <div className="text-slate-400 text-xs">Product to ad plan</div>
            </div>
          </Link>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 text-slate-400">
            <Coins className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">Credit-based billing</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
