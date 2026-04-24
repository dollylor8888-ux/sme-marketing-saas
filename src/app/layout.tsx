import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

const BASE_URL = "https://sme-marketing-saas.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Arclion Marketing | AI-Powered SME Marketing Platform",
    template: "%s | Arclion Marketing",
  },
  description: "Empower your business with 36 AI marketing skills. Create content, optimize SEO, and track analytics — all in one place.",
  keywords: ["AI marketing", "SME marketing", "marketing automation", "AI copywriting", "SEO optimization", "content creation", "marketing platform"],
  authors: [{ name: "Arclion" }],
  creator: "Arclion",
  publisher: "Arclion",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Arclion Marketing",
    title: "Arclion Marketing | AI-Powered SME Marketing Platform",
    description: "Empower your business with 36 AI marketing skills. Create content, optimize SEO, and track analytics — all in one place.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Arclion Marketing - AI-Powered Marketing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arclion Marketing | AI-Powered SME Marketing Platform",
    description: "Empower your business with 36 AI marketing skills.",
    images: ["/og-image.png"],
    creator: "@arclion",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

// JSON-LD Schema Markup
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sme-marketing-saas.vercel.app/#organization",
      name: "Arclion",
      url: "https://sme-marketing-saas.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://sme-marketing-saas.vercel.app/logo.png",
      },
      sameAs: [
        "https://twitter.com/arclion",
        "https://linkedin.com/company/arclion",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://sme-marketing-saas.vercel.app/#website",
      url: "https://sme-marketing-saas.vercel.app",
      name: "Arclion Marketing",
      publisher: { "@id": "https://sme-marketing-saas.vercel.app/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://sme-marketing-saas.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://sme-marketing-saas.vercel.app/#software",
      name: "Arclion Marketing",
      url: "https://sme-marketing-saas.vercel.app",
      description: "AI-powered marketing platform with 36 marketing skills for SMEs",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "0",
        highPrice: "29",
        offerCount: "3",
        offer: [
          {
            "@type": "Offer",
            name: "Starter",
            price: "0",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "9",
            priceCurrency: "USD",
            billingIncrement: "1",
            unitCode: "MON",
          },
          {
            "@type": "Offer",
            name: "Unlimited",
            price: "29",
            priceCurrency: "USD",
            billingIncrement: "1",
            unitCode: "MON",
          },
        ],
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "124",
      },
    },
  ],
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
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
