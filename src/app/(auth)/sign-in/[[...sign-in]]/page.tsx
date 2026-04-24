"use client";

import { useState, useEffect } from "react";

export default function SignInPage() {
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tryMount = () => {
      const clerk = (window as Window & { Clerk?: { loaded?: boolean; mountSignIn: (el: HTMLElement) => void } }).Clerk;
      const el = document.getElementById("clerk-sign-in");

      if (clerk?.loaded && el) {
        clerk.mountSignIn(el);
        setClerkReady(true);
        if (intervalId) clearInterval(intervalId);
        return;
      }

      // Keep polling until Clerk loads
      if (!intervalId && clerk) {
        intervalId = setInterval(tryMount, 200);
      }
    };

    // Start polling after initial delay
    const timerId = setTimeout(tryMount, 500);

    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
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
