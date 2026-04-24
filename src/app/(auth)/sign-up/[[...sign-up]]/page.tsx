"use client";

import { useEffect, useRef, useState } from "react";

export default function SignUpPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    // Wait for Clerk to be fully loaded before mounting
    const tryMount = () => {
      const clerk = (window as any).Clerk;
      if (clerk && ref.current) {
        if (clerk.loaded) {
          clerk.mountSignUp(ref.current);
          setClerkReady(true);
        } else {
          // Clerk exists but not loaded yet, poll
          setTimeout(tryMount, 100);
        }
      } else {
        // Clerk not loaded yet, wait and retry
        setTimeout(tryMount, 100);
      }
    };

    tryMount();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {!clerkReady && (
        <div className="text-white animate-pulse">Loading...</div>
      )}
      <div ref={ref} style={{ display: clerkReady ? 'block' : 'none' }} />
    </div>
  );
}
