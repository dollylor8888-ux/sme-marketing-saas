import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "Pricing | Arclion Marketing - AI-Powered SME Marketing Platform",
  description: "Choose the plan that fits your business. Start free with 100 credits, or unlock unlimited AI marketing power for $29/month.",
  alternates: {
    canonical: "https://sme-marketing-saas.vercel.app/pricing",
  },
  openGraph: {
    title: "Pricing | Arclion Marketing",
    description: "Choose the plan that fits your business. Start free with 100 credits, or unlock unlimited AI marketing power.",
    url: "https://sme-marketing-saas.vercel.app/pricing",
    siteName: "Arclion Marketing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Arclion Marketing",
    description: "Choose the plan that fits your business. Start free with 100 credits.",
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your business. Start free, scale as you grow.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-white font-semibold text-xl mb-2">Starter</h3>
            <p className="text-slate-400 text-sm mb-6">Perfect for trying out</p>
            <div className="text-4xl font-bold text-white mb-1">Free</div>
            <p className="text-slate-400 text-sm mb-8">100 credits</p>

            <ul className="space-y-3 mb-8">
              {[
                "100 credits on signup",
                "Access to 6 core marketing skills",
                "Copywriting assistance",
                "Basic SEO optimization",
                "Community support",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="text-green-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-center transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 bg-slate-800/50 border border-cyan-500 rounded-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">
              Most Popular
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Pro</h3>
            <p className="text-slate-400 text-sm mb-6">For regular marketers</p>
            <div className="text-4xl font-bold text-white mb-1">$9</div>
            <p className="text-slate-400 text-sm mb-8">1,000 credits / month</p>

            <ul className="space-y-3 mb-8">
              {[
                "Everything in Starter",
                "1,000 credits per month",
                "All 36 AI marketing skills",
                "Priority processing",
                "Advanced analytics",
                "Email support",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="text-cyan-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up?plan=pro"
              className="block w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold text-center transition shadow-lg shadow-cyan-500/25"
            >
              Start Pro Trial
            </Link>
          </div>

          {/* Unlimited */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-white font-semibold text-xl mb-2">Unlimited</h3>
            <p className="text-slate-400 text-sm mb-6">Power users & agencies</p>
            <div className="text-4xl font-bold text-white mb-1">$29</div>
            <p className="text-slate-400 text-sm mb-8">Unlimited credits / month</p>

            <ul className="space-y-3 mb-8">
              {[
                "Everything in Pro",
                "Unlimited credits",
                "API access",
                "Dedicated support",
                "Custom integrations",
                "Team collaboration",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="text-purple-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up?plan=unlimited"
              className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-center transition"
            >
              Go Unlimited
            </Link>
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
                a: "Credits are used to power AI marketing tasks. Each task consumes credits based on complexity. 100 credits are enough for ~20 copywriting tasks or ~10 SEO optimizations.",
              },
              {
                q: "Can I change plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What happens to unused credits?",
                a: "Monthly plans reset on your billing cycle. Unlimited plan credits never expire.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee on paid plans. Contact support for assistance.",
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
