"use client";

import { useState, useEffect } from "react";

export default function SignUpPage() {
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tryMount = () => {
      const clerk = (window as Window & { Clerk?: { loaded?: boolean; mountSignUp: (el: HTMLElement) => void } }).Clerk;
      const el = document.getElementById("clerk-sign-up");

      if (clerk?.loaded && el) {
        clerk.mountSignUp(el);
        setClerkReady(true);
        if (intervalId) clearInterval(intervalId);
        return;
      }

      if (!intervalId && clerk) {
        intervalId = setInterval(tryMount, 200);
      }
    };

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
        id="clerk-sign-up"
        style={{ display: clerkReady ? "block" : "none" }}
      />
    </div>
  );
}
