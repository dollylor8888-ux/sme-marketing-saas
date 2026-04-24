"use client";

import { useState, useEffect } from "react";

export default function SignInPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const tryMount = () => {
      if (!mounted) return;
      const win = window as typeof window & {
        Clerk?: { loaded?: boolean; mountSignIn: (el: HTMLElement) => void };
      };
      const clerk = win.Clerk;
      const el = document.getElementById("clerk-sign-in");

      if (clerk?.loaded && el) {
        clerk.mountSignIn(el);
        if (mounted) setReady(true);
        return true; // done
      }
      return false; // keep polling
    };

    // Start polling
    const interval = setInterval(() => {
      if (tryMount()) clearInterval(interval);
    }, 100);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {!ready && <div className="text-slate-400 animate-pulse">Loading...</div>}
      <div
        id="clerk-sign-in"
        style={{ display: ready ? "block" : "none" }}
      />
    </div>
  );
}
