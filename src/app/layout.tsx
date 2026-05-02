import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import SEOSchemas from "@/app/seo/schemas";
import ThemeProvider from "@/components/ThemeProvider";

export const dynamic = "force-dynamic";

const BASE_URL = "https://sme-marketing-saas.vercel.app";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Arclion Marketing | AI-Powered SME Marketing Platform",
    template: "%s | Arclion Marketing",
  },
  description:
    "Turn a product URL into Hong Kong-ready copy, SEO suggestions, Meta/Instagram ad plans, and performance recommendations. Start free with 100 credits.",
  keywords: [
    "AI marketing",
    "marketing automation",
    "SME marketing",
    "copywriting AI",
    "AI SEO",
    "content creation",
    "marketing platform",
    "email marketing",
    "social media AI",
  ],
  authors: [{ name: "Arclion" }],
  creator: "Arclion",
  publisher: "Arclion",
  openGraph: {
    type: "website",
    locale: "en_HK",
    url: BASE_URL,
    siteName: "Arclion Marketing",
    title: "Arclion Marketing | AI-Powered SME Marketing Platform",
    description:
      "AI marketing planning for Hong Kong SMEs: product analysis, copy, SEO, Meta/Instagram campaign plans, and performance recommendations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Arclion Marketing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arclion Marketing | AI-Powered SME Marketing Platform",
    description:
      "Create Hong Kong-ready copy, SEO suggestions, and Meta/Instagram campaign plans from one product URL.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <SEOSchemas />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
