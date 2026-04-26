"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="text-white font-semibold text-lg">Arclion Marketing</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/free-marketing-diagnosis"
            className="text-slate-300 hover:text-white transition text-sm"
          >
            Free Diagnosis
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
