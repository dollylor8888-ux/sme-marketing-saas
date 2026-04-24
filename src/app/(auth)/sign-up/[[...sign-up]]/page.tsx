"use client";

import { useState, useEffect } from "react";

function ClerkErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!window.Clerk) {
        setError("Clerk failed to load. Please refresh the page.");
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const tryMount = () => {
      if (window.Clerk?.loaded) {
        setClerkReady(true);
      } else if (window.Clerk) {
        window.Clerk.addListener(() => setClerkReady(true));
        setTimeout(() => {
          if (window.Clerk?.loaded) setClerkReady(true);
        }, 2000);
      } else {
        setTimeout(tryMount, 200);
      }
    };

    const timer = setTimeout(tryMount, 300);
    return () => clearTimeout(timer);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!clerkReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading Clerk...</div>
      </div>
    );
  }

  return (
    <ClerkErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        {window.Clerk?.loaded && window.Clerk ? (
          <div
            ref={(el) => {
              if (el && window.Clerk) {
                el.innerHTML = "";
                window.Clerk.mountSignUp(el);
              }
            }}
          />
        ) : (
          <div className="text-slate-400">Initializing...</div>
        )}
      </div>
    </ClerkErrorBoundary>
  );
}
