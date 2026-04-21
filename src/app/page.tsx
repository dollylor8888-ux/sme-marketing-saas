import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white">
              A
            </div>
            <span className="text-white font-semibold text-lg">Arclion Marketing</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Now in Beta — 100 free credits on signup
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          AI Marketing Tools
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            for Growing SMEs
          </span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
          Create content, optimize for SEO, run analytics — powered by 36 proven marketing skills.
          No marketing team required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-cyan-500/25"
          >
            Start Free — 100 Credits
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-lg transition border border-slate-700"
          >
            View Demo
          </Link>
        </div>

        {/* Skills Grid */}
        <div className="text-left mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Available Marketing Skills</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "✍️", name: "Copywriting", desc: "Ads, emails, social posts, landing pages" },
              { icon: "🔍", name: "AI SEO", desc: "Content optimization for AI search engines" },
              { icon: "📊", name: "Analytics", desc: "Track performance and user behavior" },
              { icon: "📱", name: "Social Content", desc: "Platform-specific social media copy" },
              { icon: "📧", name: "Email Sequences", desc: "Drip campaigns and newsletters" },
              { icon: "🎯", name: "A/B Testing", desc: "Test and optimize your marketing" },
            ].map((skill) => (
              <div
                key={skill.name}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition"
              >
                <div className="text-3xl mb-3">{skill.icon}</div>
                <h3 className="text-white font-semibold mb-1">{skill.name}</h3>
                <p className="text-slate-400 text-sm">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Starter", credits: 100, price: "Free", desc: "Perfect for trying out" },
            { name: "Pro", credits: "1,000", price: "$9", desc: "/month — For regular marketers" },
            { name: "Unlimited", credits: "Unlimited", price: "$29", desc: "/month — Power users" },
          ].map((plan) => (
            <div
              key={plan.name}
              className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl"
            >
              <h3 className="text-white font-semibold text-lg mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
              <p className="text-slate-400 text-sm mb-4">{plan.credits} credits {plan.name !== "Starter" && "/mo"}</p>
              <p className="text-slate-400 text-sm">{plan.desc}</p>
              <Link
                href="/sign-up"
                className="mt-6 block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-center transition"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
