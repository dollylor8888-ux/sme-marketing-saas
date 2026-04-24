import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import SEOSchemas from "@/app/seo/schemas";

// Force dynamic rendering so ClerkProvider context is available
export const dynamic = "force-dynamic";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Arclion Marketing | AI-Powered SME Marketing Platform",
    template: "%s | Arclion Marketing",
  },
  description:
    "Empower your business with 36 AI marketing skills. Create content, optimize SEO, and track analytics — all in one place. Start free with 100 credits.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sme-marketing-saas.vercel.app",
    siteName: "Arclion Marketing",
    title: "Arclion Marketing | AI-Powered SME Marketing Platform",
    description:
      "Empower your business with 36 AI marketing skills. Create content, optimize SEO, and track analytics — all in one place.",
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
      "Create content, optimize SEO, and track analytics — powered by 36 AI marketing skills.",
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
    canonical: "https://sme-marketing-saas.vercel.app",
  },
};

export default function RootLayout({
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
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SEOSchemas />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
