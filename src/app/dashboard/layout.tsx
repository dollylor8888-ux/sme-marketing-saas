"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Coins } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Overview" },
  { href: "/dashboard/credits", icon: "💰", label: "Credits" },
  { href: "/dashboard/copywriting", icon: "✍️", label: "Copywriting" },
  { href: "/dashboard/seo", icon: "🔍", label: "AI SEO" },
  { href: "/dashboard/product-marketing", icon: "🚀", label: "Product Marketing" },
  { href: "/dashboard/history", icon: "📜", label: "History" },
  { href: "/dashboard/settings/memory", icon: "🧠", label: "Memory Settings" },
];

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
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
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
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
            <Coins className="w-4 h-4 text-cyan-400" />
            <span className="text-white text-sm">Credits</span>
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
