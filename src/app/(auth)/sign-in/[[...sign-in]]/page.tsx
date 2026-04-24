"use client";

import { useState, useEffect } from "react";

export default function SignInPage() {
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    const mount = () => {
      const clerk = (window as Window & { Clerk?: { loaded?: boolean; mountSignIn: (el: HTMLElement) => void } }).Clerk;
      const el = document.getElementById("clerk-sign-in");
      if (clerk?.loaded && el) {
        clerk.mountSignIn(el);
        setClerkReady(true);
      } else if (clerk) {
        // Poll until loaded
        const interval = setInterval(() => {
          const c = (window as Window & { Clerk?: { loaded?: boolean; mountSignIn: (el: HTMLElement) => void } }).Clerk;
          const e = document.getElementById("clerk-sign-in");
          if (c?.loaded && e) {
            c.mountSignIn(e);
            setClerkReady(true);
            clearInterval(interval);
          }
        }, 100);
      }
    };

    // Small delay to ensure Clerk SDK script has run
    const timer = setTimeout(mount, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {!clerkReady && (
        <div className="text-slate-400 animate-pulse">Loading...</div>
      )}
      <div
        id="clerk-sign-in"
        style={{ display: clerkReady ? "block" : "none" }}
      />
    </div>
  );
}
