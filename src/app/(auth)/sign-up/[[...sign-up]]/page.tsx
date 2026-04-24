"use client";

import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

function SignUpFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white animate-pulse">Loading...</div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Suspense fallback={<SignUpFallback />}>
        <SignUp />
      </Suspense>
    </div>
  );
}
