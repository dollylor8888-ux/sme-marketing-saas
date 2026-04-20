# Arclion Marketing SaaS

AI-powered marketing platform for SMEs — powered by 36 marketing skills.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your API keys

# 3. Set up database
npx prisma migrate dev

# 4. Run dev server
npm run dev
```

## Architecture

```
src/
├── app/
│   ├── (auth)/              # Clerk auth pages
│   ├── (dashboard)/         # User dashboard
│   │   ├── copywriting/     # Copywriting tool
│   │   ├── seo/             # AI SEO tool
│   │   └── credits/         # Credit management
│   └── api/
│       ├── actions/         # Skill APIs (copywriting, ai-seo)
│       └── credits/         # Credit system
├── lib/
│   ├── billing/            # Hidden from users
│   │   ├── credit-system.ts     # User-facing credit ops
│   │   ├── token-tracker.ts     # Token usage (Boss only)
│   │   └── margin-calculator.ts # Profit tracking (Boss only)
│   ├── skills/             # Marketing skills
│   │   ├── copywriting/
│   │   └── ai-seo/
│   └── db/                 # Prisma schema
```

## Key Features

| Feature | Description |
|---------|-------------|
| **Credit System** | Users top up credits to use marketing tools |
| **Token Tracker** | Backend tracks actual API costs per call |
| **Margin Calculator** | Hidden dashboard shows profit per action |
| **Skills** | Copywriting, AI SEO, Analytics (expandable to 36) |

## User Flow

```
Sign Up → 100 Free Credits → Use Tool → Deduct Credits → (Optional: Top Up)
```

## Boss (Admin) Flow

```
Token Logs → API Costs → Margin = Revenue - Costs
(Dashboard hidden from users, accessible via secret route)
```

## Adding More Skills

1. Create skill in `src/lib/skills/<skill-name>/`
2. Add API route in `src/app/api/actions/<skill-name>/`
3. Update `SkillCreditCost` in `src/lib/billing/models.ts`
4. Add link in dashboard sidebar

## Boss (Admin) Dashboard

Access via `/boss` — requires `BOSS_SECRET_KEY` in request header.

```
curl -H "x-boss-key: your-secret-key" https://yourapp.com/api/boss/margin-summary
```

Shows:
- Total revenue, API costs, and margin
- Per-skill profitability breakdown
- Daily trend of tokens, costs, and margins
- Model pricing reference

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** Clerk
- **AI:** OpenAI SDK
- **Deployment:** Vercel
