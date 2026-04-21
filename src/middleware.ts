import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Dashboard routes need Clerk auth
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Boss API routes need BOSS_SECRET_KEY (not the page itself)
const isBossApiRoute = createRouteMatcher(["/api/boss(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Boss API routes need BOSS_SECRET_KEY
  if (isBossApiRoute(req)) {
    const bossKey = req.headers.get("x-boss-key");
    if (bossKey !== process.env.BOSS_SECRET_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Dashboard routes need Clerk auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|sign-in|sign-up).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
