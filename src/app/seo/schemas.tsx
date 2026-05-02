import { WebSite, Organization, FAQPage, SoftwareApplication } from "schema-dts";
import { JsonLd } from "@/components/JsonLd";
import { MARKETING_PLANS } from "@/lib/billing/pricing";

const websiteJsonLd: WebSite = {
  "@type": "WebSite",
  name: "Arclion Marketing",
  url: "https://sme-marketing-saas.vercel.app",
  description:
    "AI marketing planning for Hong Kong SMEs. Create copy, SEO suggestions, Meta/Instagram ad plans, and performance recommendations from one product URL.",
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
    "AI-powered marketing platform for Hong Kong SMEs running ecommerce, retail, F&B, and service campaigns.",
  areaServed: "Hong Kong",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Arclion Marketing Plans",
    itemListElement: MARKETING_PLANS.map((plan) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: plan.name,
        description: plan.credits,
      },
      price: plan.id === "agency" ? "1280" : plan.price.replace("HK$", ""),
      priceCurrency: "HKD",
    })),
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
    highPrice: "1280",
    priceCurrency: "HKD",
    offerCount: MARKETING_PLANS.length,
  },
  description:
    "AI marketing platform for Hong Kong SMEs that helps generate campaign copy, SEO suggestions, and Meta/Instagram ad plans.",
};

const faqJsonLd: FAQPage = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Arclion Marketing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Arclion Marketing helps Hong Kong SMEs turn product URLs into copy, SEO suggestions, Meta/Instagram ad plans, and performance recommendations.",
      },
    },
    {
      "@type": "Question",
      name: "How much do the plans cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plans start free with 100 welcome credits. Paid plans are priced in HKD, starting from HK$88 per month for Starter and HK$288 per month for Growth.",
      },
    },
    {
      "@type": "Question",
      name: "What can I do with the free credits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With 100 free credits, you can test starter copywriting and AI SEO tasks and preview the free marketing diagnosis workflow.",
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
