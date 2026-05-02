import Link from "next/link";
import Header from "@/components/Header";
import { CREDIT_PACKAGES, MARKETING_PLANS, formatHkd } from "@/lib/billing/pricing";

export const metadata = {
  title: "Pricing | Arclion Marketing - AI-Powered SME Marketing Platform",
  description: "Hong Kong pricing for Arclion Marketing. Start free, then scale with HKD plans and flexible credit packs for SME campaigns.",
  alternates: {
    canonical: "https://sme-marketing-saas.vercel.app/pricing",
  },
  openGraph: {
    title: "Pricing | Arclion Marketing",
    description: "Simple HKD pricing for Hong Kong SMEs using AI for copy, SEO, and Meta/Instagram campaign planning.",
    url: "https://sme-marketing-saas.vercel.app/pricing",
    siteName: "Arclion Marketing",
    locale: "en_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Arclion Marketing",
    description: "Start free, then scale with HKD monthly plans and flexible credit packs.",
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hong Kong SME Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start with a free diagnosis, then scale into monthly campaign work with clear HKD plans.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 bg-slate-800/50 border rounded-2xl relative flex flex-col ${
                plan.featured ? "border-cyan-500" : "border-slate-700"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                  Recommended
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-white font-semibold text-xl mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm min-h-10">{plan.audience}</p>
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                {plan.cadence && <span className="text-slate-400 text-sm ml-1">{plan.cadence}</span>}
              </div>
              <p className="text-cyan-400 text-sm mb-4">{plan.credits}</p>
              <p className="text-slate-400 text-sm mb-6 min-h-20">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className={plan.featured ? "text-cyan-400" : "text-green-400"}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full py-3 rounded-lg font-medium text-center transition ${
                  plan.featured
                    ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Need extra credits?</h2>
            <p className="text-slate-400">
              Add top-ups when a campaign sprint needs more generations or analysis.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {CREDIT_PACKAGES.map((pack) => (
              <div key={pack.id} className="p-5 bg-slate-800/30 border border-slate-700 rounded-xl">
                <div className="text-white font-semibold mb-1">{pack.label}</div>
                <div className="text-slate-400 text-sm mb-4">{pack.note}</div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{formatHkd(pack.priceHkd)}</div>
                    <div className="text-cyan-400 text-sm">{pack.credits.toLocaleString()} credits</div>
                  </div>
                  <div className="text-slate-500 text-xs text-right">
                    HK${(pack.priceHkd / pack.credits).toFixed(2)}
                    <br />
                    per credit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What are credits?",
                a: "Credits power AI marketing tasks. A simple copywriting task uses fewer credits than a full product analysis or campaign plan.",
              },
              {
                q: "Why price in HKD?",
                a: "Arclion is being shaped first for Hong Kong SMEs, so monthly plans, top-ups, and campaign budgets are easier to compare in HKD.",
              },
              {
                q: "Do monthly credits roll over?",
                a: "Monthly plan credits reset each billing cycle. Top-up credits are intended for campaign bursts and remain available while the account is active.",
              },
              {
                q: "Which plan should a small shop start with?",
                a: "Start with Free if you are testing the product. Choose Growth once you are running monthly Meta or Instagram campaigns and want performance feedback.",
              },
            ].map((faq) => (
              <div key={faq.q} className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
                <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
