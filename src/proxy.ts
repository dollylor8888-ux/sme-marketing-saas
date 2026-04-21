import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Dashboard routes need Clerk auth
const isProtectedRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith("/dashboard");
};

// Boss API routes need BOSS_SECRET_KEY
const isBossApiRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith("/api/boss");
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Dashboard routes need Clerk auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Boss API routes need BOSS_SECRET_KEY
  if (isBossApiRoute(req)) {
    const bossKey = req.headers.get("x-boss-key");
    if (bossKey !== process.env.BOSS_SECRET_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|sign-in|sign-up|api/boss|favicon.ico).*)",
    "/",
  ],
};
