import { ProductInfo, SellingPoint } from "@/app/dashboard/product-marketing/types/product-marketing";

type DiagnosisType = "ecommerce" | "restaurant" | "service";

export interface DiagnosisInsight {
  title: string;
  finding: string;
  action: string;
}

export interface AudienceSegment {
  name: string;
  description: string;
  messageAngle: string;
}

export interface CampaignPlanPreview {
  budget: string;
  structure: string[];
  copySamples: {
    headline: string;
    primaryText: string;
    cta: string;
  }[];
}

export interface MarketingDiagnosis {
  inputUrl: string;
  normalizedUrl: string;
  domain: string;
  brandName: string;
  type: DiagnosisType;
  summary: string;
  freeInsights: DiagnosisInsight[];
  quickWins: string[];
  audienceSegments: AudienceSegment[];
  campaignPlan: CampaignPlanPreview;
  product: ProductInfo;
  sellingPoints: SellingPoint[];
}

const RESTAURANT_HINTS = ["food", "cafe", "coffee", "restaurant", "dining", "menu", "eat", "kitchen"];
const SERVICE_HINTS = ["clinic", "studio", "salon", "spa", "coach", "consult", "agency", "service"];

export function normalizeMarketingUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "your-site.com";
  }
}

function titleCase(value: string): string {
  return value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferType(domain: string): DiagnosisType {
  const lower = domain.toLowerCase();
  if (RESTAURANT_HINTS.some((hint) => lower.includes(hint))) return "restaurant";
  if (SERVICE_HINTS.some((hint) => lower.includes(hint))) return "service";
  return "ecommerce";
}

function getBrandName(domain: string): string {
  const root = domain.split(".")[0] || "Your Brand";
  return titleCase(root);
}

export function buildMarketingDiagnosis(rawUrl: string): MarketingDiagnosis {
  const normalizedUrl = normalizeMarketingUrl(rawUrl);
  const domain = getDomain(normalizedUrl);
  const brandName = getBrandName(domain);
  const type = inferType(domain);
  const isRestaurant = type === "restaurant";
  const isService = type === "service";
  const productName = isRestaurant
    ? `${brandName} Signature Offer`
    : isService
      ? `${brandName} Service Package`
      : `${brandName} Hero Product`;

  const summary = isRestaurant
    ? "Your first paid campaign should sell one clear dining occasion, not the whole menu."
    : isService
      ? "Your first paid campaign should turn trust into a simple booking or consultation action."
      : "Your first paid campaign should make one product and one offer unmistakably clear.";

  const freeInsights: DiagnosisInsight[] = [
    {
      title: "Positioning",
      finding: isRestaurant
        ? "The page needs one signature reason to visit now: occasion, dish, set, or limited-time offer."
        : isService
          ? "The page needs a stronger trust hook before asking visitors to book or enquire."
          : "The page should lead with the product outcome and offer, not only features or brand story.",
      action: "Make the first ad angle specific enough to answer: why this, why now, why us.",
    },
    {
      title: "Audience",
      finding: "For Hong Kong SMEs, broad interest targeting usually needs clearer creative segmentation.",
      action: "Split the first campaign into 2-3 audience angles instead of one generic ad set.",
    },
    {
      title: "Conversion Gap",
      finding: "The likely gap is not more content. It is turning product value into an offer people can act on.",
      action: "Use one landing CTA across the campaign: buy, book, WhatsApp, reserve, or enquire.",
    },
  ];

  const quickWins = [
    "Rewrite the first ad hook in Traditional Chinese and natural Hong Kong tone.",
    "Create one offer-led visual: product, price/value, and CTA visible within 2 seconds.",
    "Prepare one CSV export from Meta Ads Manager so the second cycle can learn from real data.",
  ];

  const audienceSegments: AudienceSegment[] = isRestaurant
    ? [
        {
          name: "Weekend Planners",
          description: "Hong Kong adults planning dinners, gatherings, or date nights.",
          messageAngle: "Make the occasion easy to choose and easy to book.",
        },
        {
          name: "Food Discovery",
          description: "Instagram-heavy users who save restaurants and compare dishes visually.",
          messageAngle: "Lead with the signature dish and sensory proof.",
        },
        {
          name: "Retargeting",
          description: "Recent visitors, menu viewers, and engaged social users.",
          messageAngle: "Use urgency: limited seats, set menu, or this-week offer.",
        },
      ]
    : isService
      ? [
          {
            name: "Problem Aware",
            description: "People already searching for a solution but comparing providers.",
            messageAngle: "Lead with trust, process, and expected outcome.",
          },
          {
            name: "Local Intent",
            description: "Hong Kong users near service areas or with relevant interests.",
            messageAngle: "Make booking or enquiry feel low-risk.",
          },
          {
            name: "Retargeting",
            description: "Website visitors and social engagers who did not enquire.",
            messageAngle: "Answer one common objection and repeat the CTA.",
          },
        ]
      : [
          {
            name: "Value Seekers",
            description: "Hong Kong shoppers comparing quality, price, delivery, and reviews.",
            messageAngle: "Show the product benefit and the reason to buy now.",
          },
          {
            name: "Lifestyle Buyers",
            description: "Instagram and Facebook users who respond to visual use cases.",
            messageAngle: "Show the product in a Hong Kong daily-life scene.",
          },
          {
            name: "Retargeting",
            description: "Product page visitors, cart viewers, and engaged social users.",
            messageAngle: "Use proof, offer reminder, and a direct CTA.",
          },
        ];

  const campaignPlan: CampaignPlanPreview = {
    budget: "HK$3,000-8,000 first test budget over 7-10 days",
    structure: [
      "Campaign objective: Sales or Leads",
      "Ad set 1: Main cold audience angle",
      "Ad set 2: Visual/lifestyle audience angle",
      "Ad set 3: Retargeting if traffic is available",
      "2 ads per ad set: one offer-led, one story-led",
    ],
    copySamples: [
      {
        headline: isRestaurant ? "今晚想食好啲？" : isService ? "預約前，先睇清楚值唔值得" : "唔使再估邊款啱你",
        primaryText: isRestaurant
          ? `${brandName} 幫你將今個週末晚餐安排好。主打招牌菜、清楚價值、即刻預約。`
          : isService
            ? `${brandName} 將服務流程、效果同下一步講清楚，令你可以放心查詢。`
            : `${brandName} 將產品賣點、使用場景同優惠一次講清楚，幫你更快決定。`,
        cta: isRestaurant ? "Reserve Now" : isService ? "Book Consultation" : "Shop Now",
      },
    ],
  };

  const product: ProductInfo = {
    name: productName,
    price: isRestaurant ? "HK$188-388" : isService ? "Quote-based" : "HK$198-688",
    platform: domain.includes("shopify") ? "shopify" : "website",
    url: normalizedUrl,
    description: summary,
    features: [
      { name: "Clear offer angle", category: "strategy" },
      { name: "Hong Kong audience fit", category: "audience" },
      { name: "Meta/Instagram ready", category: "channel" },
      { name: "Performance review loop", category: "optimization" },
    ],
    analysis: {
      targetAudience: audienceSegments[0]?.description,
      emotionalDrivers: isRestaurant ? ["想試新嘢", "聚會感", "即時決定"] : ["信任", "方便", "少風險"],
      useCases: isRestaurant ? ["週末聚餐", "節日推廣", "再行銷"] : ["新品推廣", "限時優惠", "再行銷"],
    },
  };

  const sellingPoints: SellingPoint[] = [
    { id: "diag-1", point: freeInsights[0].action, category: "benefit", confirmed: true },
    { id: "diag-2", point: audienceSegments[0]?.messageAngle ?? "Clarify the main campaign angle", category: "emotional", confirmed: true },
    { id: "diag-3", point: quickWins[0], category: "feature", confirmed: true },
    { id: "diag-4", point: "Use HKD budget planning and Meta/IG campaign structure from the start", category: "social", confirmed: true },
  ];

  return {
    inputUrl: rawUrl,
    normalizedUrl,
    domain,
    brandName,
    type,
    summary,
    freeInsights,
    quickWins,
    audienceSegments,
    campaignPlan,
    product,
    sellingPoints,
  };
}
