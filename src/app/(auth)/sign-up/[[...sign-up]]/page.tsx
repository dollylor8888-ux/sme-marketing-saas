"use client";

import { useEffect, useRef } from "react";

export default function SignUpPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && (window as any).Clerk) {
      (window as any).Clerk.mountSignUp(ref.current);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div ref={ref} />
    </div>
  );
}
