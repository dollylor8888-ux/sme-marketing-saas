"use client";

import { useState, useEffect } from "react";

export default function SignUpPage() {
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    const mount = () => {
      const clerk = (window as Window & { Clerk?: { loaded?: boolean; mountSignUp: (el: HTMLElement) => void } }).Clerk;
      const el = document.getElementById("clerk-sign-up");
      if (clerk?.loaded && el) {
        clerk.mountSignUp(el);
        setClerkReady(true);
      } else if (clerk) {
        const interval = setInterval(() => {
          const c = (window as Window & { Clerk?: { loaded?: boolean; mountSignUp: (el: HTMLElement) => void } }).Clerk;
          const e = document.getElementById("clerk-sign-up");
          if (c?.loaded && e) {
            c.mountSignUp(e);
            setClerkReady(true);
            clearInterval(interval);
          }
        }, 100);
      }
    };

    const timer = setTimeout(mount, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {!clerkReady && (
        <div className="text-slate-400 animate-pulse">Loading...</div>
      )}
      <div
        id="clerk-sign-up"
        style={{ display: clerkReady ? "block" : "none" }}
      />
    </div>
  );
}
