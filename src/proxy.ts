import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { applyRateLimit } from "@/middleware/rate-limit";

// Dashboard routes need Clerk auth
const isProtectedRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith("/dashboard");
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Rate limit for all API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${ip}:${req.nextUrl.pathname}`;
    const result = applyRateLimit(key, { limit: 120, windowMs: 60_000 });
    if (!result.allowed) {
      return Response.json(
        {
          error: "Too many requests",
          retryAfterMs: Math.max(result.resetAt - Date.now(), 0),
        },
        { status: 429 }
      );
    }
  }

  // Dashboard routes need Clerk auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|favicon.ico).*)",
    "/",
  ],
};
