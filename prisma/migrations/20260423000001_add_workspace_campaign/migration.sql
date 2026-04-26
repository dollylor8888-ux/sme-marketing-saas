-- AddWorkspaceAndCampaignTables
-- Note: Some tables may already exist from previous schema

-- Create Workspace table
CREATE TABLE IF NOT EXISTS "Workspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- Add workspaceId column to existing tables that need it
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "workspacesWorkspace" TEXT;

-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" TEXT,
    "features" TEXT[],
    "sellingPoints" JSONB,
    "competitiveEdge" TEXT,
    "avgCTR" DOUBLE PRECISION,
    "avgROAS" DOUBLE PRECISION,
    "totalSpend" DOUBLE PRECISION,
    "totalConversions" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Create Campaign table
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'facebook',
    "objective" TEXT NOT NULL DEFAULT 'sales',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalBudget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'HKD',
    "totalImpressions" INTEGER,
    "totalClicks" INTEGER,
    "totalConversions" INTEGER,
    "totalSpend" DOUBLE PRECISION,
    "avgROAS" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- Create AdSet table
CREATE TABLE IF NOT EXISTS "AdSet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audienceDesc" TEXT,
    "budget" DOUBLE PRECISION,
    "budgetPercent" INTEGER,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "ctr" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "conversions" INTEGER,
    "spend" DOUBLE PRECISION,
    "roas" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdSet_pkey" PRIMARY KEY ("id")
);

-- Create Ad table
CREATE TABLE IF NOT EXISTS "Ad" (
    "id" TEXT NOT NULL,
    "adSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT,
    "primaryText" TEXT,
    "cta" TEXT,
    "description" TEXT,
    "assetName" TEXT,
    "assetType" TEXT,
    "assetUrl" TEXT,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "ctr" DOUBLE PRECISION,
    "spend" DOUBLE PRECISION,
    "conversions" INTEGER,
    "videoViews" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- Create CampaignPerformance table
CREATE TABLE IF NOT EXISTS "CampaignPerformance" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "campaignName" TEXT NOT NULL,
    "adsetName" TEXT NOT NULL,
    "adName" TEXT NOT NULL,
    "assetName" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "spend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION,
    "roas" DOUBLE PRECISION,
    "reach" INTEGER,
    "frequency" DOUBLE PRECISION,
    "videoViews" INTEGER,
    "video2SecViews" INTEGER,
    "thumbnailUrl" TEXT,
    "campaignId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignPerformance_pkey" PRIMARY KEY ("id")
);

-- Create Learning table
CREATE TABLE IF NOT EXISTS "Learning" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Learning_pkey" PRIMARY KEY ("id")
);

-- Add workspaceId to BrandMemory if not exists
ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "workspaceId" TEXT;
ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "winningStyles" TEXT[];
ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "bestTopics" TEXT[];
ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "bestAudiences" TEXT[];

-- Add workspaceId to GenerationHistory if not exists
ALTER TABLE "GenerationHistory" ADD COLUMN IF NOT EXISTS "workspaceId" TEXT;

-- Add ProductMemory fields
ALTER TABLE "ProductMemory" ADD COLUMN IF NOT EXISTS "priceRange" TEXT;
ALTER TABLE "ProductMemory" ADD COLUMN IF NOT EXISTS "position" TEXT;

-- Add foreign keys (will fail if already exists, which is OK)
DO $$
BEGIN
    ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "BrandMemory" ADD CONSTRAINT "BrandMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AdSet" ADD CONSTRAINT "AdSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Ad" ADD CONSTRAINT "Ad_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "AdSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "CampaignPerformance" ADD CONSTRAINT "CampaignPerformance_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "CampaignPerformance" ADD CONSTRAINT "CampaignPerformance_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Learning" ADD CONSTRAINT "Learning_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Learning" ADD CONSTRAINT "Learning_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Workspace_userId_idx" ON "Workspace"("userId");
CREATE INDEX IF NOT EXISTS "Product_workspaceId_idx" ON "Product"("workspaceId");
CREATE INDEX IF NOT EXISTS "Campaign_workspaceId_idx" ON "Campaign"("workspaceId");
CREATE INDEX IF NOT EXISTS "Campaign_productId_idx" ON "Campaign"("productId");
CREATE INDEX IF NOT EXISTS "AdSet_campaignId_idx" ON "AdSet"("campaignId");
CREATE INDEX IF NOT EXISTS "Ad_adSetId_idx" ON "Ad"("adSetId");
CREATE INDEX IF NOT EXISTS "CampaignPerformance_workspaceId_idx" ON "CampaignPerformance"("workspaceId");
CREATE INDEX IF NOT EXISTS "CampaignPerformance_campaignName_idx" ON "CampaignPerformance"("campaignName");
CREATE INDEX IF NOT EXISTS "Learning_workspaceId_idx" ON "Learning"("workspaceId");
CREATE INDEX IF NOT EXISTS "Learning_productId_idx" ON "Learning"("productId");
CREATE INDEX IF NOT EXISTS "GenerationHistory_workspaceId_idx" ON "GenerationHistory"("workspaceId");
