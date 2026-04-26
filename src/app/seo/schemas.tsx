import { Metadata } from "next";
import { WebSite, Organization, FAQPage, SoftwareApplication } from "schema-dts";
import { JsonLd } from "@/components/JsonLd";

const websiteJsonLd: WebSite = {
  "@type": "WebSite",
  name: "Arclion Marketing",
  url: "https://sme-marketing-saas.vercel.app",
  description:
    "AI-powered SME marketing platform with 36 proven marketing skills. Create content, optimize SEO, and track analytics — no marketing team required.",
  publisher: {
    "@type": "Organization",
    name: "Arclion",
    url: "https://sme-marketing-saas.vercel.app",
  },
};

const organizationJsonLd: Organization = {
  "@type": "Organization",
  name: "Arclion",
  url: "https://sme-marketing-saas.vercel.app",
  description:
    "AI-powered marketing platform for growing SMEs. Create content, optimize for SEO, run analytics — powered by 36 proven marketing skills.",
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Arclion Marketing Plans",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Starter",
          description: "100 free credits",
        },
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Pro",
          description: "1,000 credits/month",
        },
        price: "9",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Unlimited",
          description: "Unlimited credits/month",
        },
        price: "29",
        priceCurrency: "USD",
      },
    ],
  },
};

const softwareAppJsonLd: SoftwareApplication = {
  "@type": "SoftwareApplication",
  name: "Arclion Marketing",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "29",
    priceCurrency: "USD",
    offerCount: 3,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
  description:
    "AI-powered marketing platform with 36 proven marketing skills. Create content, optimize SEO, and track analytics.",
};

const faqJsonLd: FAQPage = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Arclion Marketing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Arclion Marketing is an AI-powered marketing platform for SMEs. It provides 36 proven marketing skills including copywriting, AI SEO, analytics, social content, email sequences, and A/B testing — all in one platform.",
      },
    },
    {
      "@type": "Question",
      name: "How much do the plans cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Starter is free with 100 credits. Pro costs $9/month for 1,000 credits. Unlimited costs $29/month for unlimited credits.",
      },
    },
    {
      "@type": "Question",
      name: "What can I do with the free credits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With 100 free credits, you can try all features including copywriting, AI SEO optimization, social media content creation, and email sequences before committing to a paid plan.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a credit card to sign up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, sign up is completely free with 100 credits. No credit card required. Paid plans can be activated anytime.",
      },
    },
  ],
};

export default function SEOSchemas() {
  return (
    <>
      <JsonLd jsonLd={websiteJsonLd} />
      <JsonLd jsonLd={organizationJsonLd} />
      <JsonLd jsonLd={softwareAppJsonLd} />
      <JsonLd jsonLd={faqJsonLd} />
    </>
  );
}
