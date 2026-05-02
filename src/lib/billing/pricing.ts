export const PRICING_CURRENCY = "HKD";

export const MARKETING_PLANS = [
  {
    id: "free",
    name: "Free",
    audience: "Validate the workflow",
    price: "HK$0",
    cadence: "",
    credits: "100 welcome credits",
    description: "For owners who want to test one product or landing page before committing.",
    cta: "Start Free",
    href: "/sign-up",
    featured: false,
    features: [
      "1 workspace",
      "Free marketing diagnosis preview",
      "Starter copywriting and AI SEO tools",
      "Traditional Chinese and English outputs",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    audience: "Solo shops and lean SME owners",
    price: "HK$88",
    cadence: "/month",
    credits: "1,000 credits / month",
    description: "Enough for regular copy, SEO, and lightweight ad planning without hiring a marketer.",
    cta: "Start Starter",
    href: "/sign-up?plan=starter",
    featured: false,
    features: [
      "Everything in Free",
      "Product URL analysis",
      "Meta/Instagram ad copy drafts",
      "Hong Kong tone presets",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    audience: "Active ecommerce, retail, and F&B teams",
    price: "HK$288",
    cadence: "/month",
    credits: "4,000 credits / month",
    description: "For SMEs running monthly campaigns and needing a repeatable plan-to-performance loop.",
    cta: "Choose Growth",
    href: "/sign-up?plan=growth",
    featured: true,
    features: [
      "Everything in Starter",
      "Product Marketing Intelligence wizard",
      "Campaign structure and HKD budget planning",
      "CSV performance upload and recommendations",
      "Brand memory for repeat campaigns",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    audience: "Freelancers, consultants, and small agencies",
    price: "HK$1,280+",
    cadence: "/month",
    credits: "25,000+ credits / month",
    description: "For partners managing multiple SME clients and packaging Arclion into services.",
    cta: "Talk to Sales",
    href: "/sign-up?plan=agency",
    featured: false,
    features: [
      "Multiple client workspaces",
      "Higher credit limits",
      "Client-ready campaign reports",
      "Priority onboarding",
      "Partner referral support",
    ],
  },
] as const;

export const CREDIT_PACKAGES = [
  {
    id: "topup-500",
    label: "Starter Top-up",
    credits: 500,
    priceHkd: 58,
    note: "A small boost for extra copy and SEO tasks.",
  },
  {
    id: "topup-1500",
    label: "Campaign Pack",
    credits: 1500,
    priceHkd: 128,
    note: "Best for one focused product campaign sprint.",
  },
  {
    id: "topup-5000",
    label: "Growth Pack",
    credits: 5000,
    priceHkd: 388,
    note: "For heavier monthly campaign and reporting work.",
  },
] as const;

export function formatHkd(amount: number): string {
  return `HK$${amount.toLocaleString("en-HK")}`;
}
