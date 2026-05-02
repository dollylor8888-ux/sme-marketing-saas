# Arclion Marketing SaaS

Arclion is a Hong Kong SME marketing workflow product. The current MVP is intentionally narrow:

1. Free diagnosis: a visitor pastes a product or website URL and receives a short Hong Kong market diagnosis.
2. Campaign generation: the diagnosis becomes a Meta/Instagram campaign plan with audience angles, selling points, Traditional Chinese/Cantonese ad copy, and HKD budget guidance.
3. Performance review: the user can later upload campaign data so Arclion can recommend the next iteration.

The product direction is diagnosis first, tools later. The goal is to acquire users through a useful free report, then convert the ones who trust the diagnosis into paid campaign planning.

## Product Model

| Layer | Purpose | User Value |
|-------|---------|------------|
| Free marketing diagnosis | Acquisition entry point | Quick positioning, audience, and conversion-gap feedback from a URL |
| Campaign Studio | Core paid workflow | URL diagnosis into HK-ready Meta/IG campaign structure and ad copy |
| Credits and billing | Monetization | HKD plans and credit packs for repeat campaign generation |
| Performance review | Retention loop | Use campaign results to decide the next creative and budget move |

## Current Pricing

| Plan | Price | Credits |
|------|-------|---------|
| Free | HK$0 | 100 welcome credits |
| Starter | HK$88/month | 1,000 credits |
| Growth | HK$288/month | 4,000 credits |
| Agency | HK$1,280+/month | 25,000+ credits |

Credit packs are also available for one-off top ups.

## Key Routes

| Route | Description |
|-------|-------------|
| `/free-marketing-diagnosis` | Public URL input and free diagnosis entry |
| `/free-marketing-diagnosis/result?url=...` | Public diagnosis result and campaign-plan CTA |
| `/dashboard` | Campaign-oriented dashboard overview |
| `/dashboard/product-marketing` | Campaign Studio wizard |
| `/dashboard/credits` | HKD plan and credit pack management |
| `/pricing` | Public HKD pricing page |

## User Flow

```text
Visitor pastes URL
  -> Free marketing diagnosis
  -> Sign up when they want the full plan
  -> Campaign Studio generates audience, selling points, structure, copy, and budget
  -> User runs ads
  -> User uploads results for review
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in Clerk, database, AI, and payment keys as needed

# 3. Set up database
npx prisma migrate dev

# 4. Run dev server
npm run dev

# 5. Run tests
npm test
```

## Verification

```bash
npx tsc --noEmit
npm test
npm run lint
```

Current status:

| Check | Status |
|-------|--------|
| TypeScript | Passing |
| Tests | Passing, 13 tests |
| Lint | Existing repo lint debt remains |

Known lint debt currently includes CommonJS helper scripts, a test setup `any`, an empty Clerk interface, and several existing unused-variable warnings.

## Architecture

```text
src/
├── app/
│   ├── free-marketing-diagnosis/
│   │   ├── page.tsx
│   │   └── result/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── product-marketing/
│   │   └── credits/
│   ├── api/
│   │   ├── ad-direction/
│   │   ├── creative-content/
│   │   ├── product-analysis/
│   │   └── credits/
│   └── pricing/
├── lib/
│   ├── billing/
│   │   ├── credit-system.ts
│   │   ├── margin-calculator.ts
│   │   └── pricing.ts
│   ├── marketing/
│   │   ├── diagnosis.ts
│   │   └── diagnosis.test.ts
│   ├── skills/
│   └── db/
```

## Implementation Notes

- `src/lib/marketing/diagnosis.ts` is the shared MVP diagnosis helper. It normalizes a URL, infers a simple business type, and produces the free diagnosis plus campaign-plan preview.
- `src/app/free-marketing-diagnosis/result/page.tsx` uses the same helper as the dashboard so the public report and paid workflow stay aligned.
- `src/app/dashboard/product-marketing/page.tsx` accepts a `url` query parameter and opens the Campaign Studio at the diagnosis step.
- Real crawling and AI product analysis can replace the deterministic helper later without changing the user journey.

## Tech Stack

- Framework: Next.js 16 App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Auth: Clerk
- Database: PostgreSQL with Prisma
- AI: OpenAI SDK compatible provider setup
- Payments: Stripe framework
- Tests: Vitest
