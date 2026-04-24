"use client";

import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white animate-pulse">Loading...</div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Suspense fallback={<SignInFallback />}>
        <SignIn />
      </Suspense>
    </div>
  );
}
