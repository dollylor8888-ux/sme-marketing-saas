import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // AI Search Bots — allow for citation
      {
        userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended"],
        allow: "/",
      },
      // Block training bots (optional — prevents training but allows search citation)
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: "https://sme-marketing-saas.vercel.app/sitemap.xml",
  };
}
