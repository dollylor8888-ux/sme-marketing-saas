import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/billing/credit-system';
import { z } from 'zod';

// Validation schemas
const brandMemorySchema = z.object({
  brandName: z.string().optional(),
  brandVoice: z.string().optional(),
  targetMarket: z.string().optional(),
  keyDifferentiators: z.string().optional(),
  customerProfile: z.string().optional(),
  brandValues: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
});

const productSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().optional(),
  category: z.string().optional(),
  features: z.array(z.string()).optional(),
  sellingPoints: z.any().optional(), // JSON field
  competitiveEdge: z.string().optional(),
});

const preferencesSchema = z.object({
  defaultTone: z.string().optional(),
  defaultLanguage: z.string().optional(),
  preferredPlatforms: z.array(z.string()).optional(),
  notificationEmail: z.boolean().optional(),
});

const memoryPostSchema = z.object({
  type: z.enum(['brandMemory', 'product', 'preferences']),
  data: z.union([brandMemorySchema, productSchema, preferencesSchema]),
});

// GET /api/memory — Load all memory for current user
// POST /api/memory — Save brand/product memory

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get first workspace for this user (default workspace)
    const workspace = await prisma.workspace.findFirst({
      where: { userId: user.id },
    });

    // Load memory records
    const [brandMemory, products, preferences] = await Promise.all([
      workspace ? prisma.brandMemory.findUnique({ where: { workspaceId: workspace.id } }) : null,
      workspace ? prisma.product.findMany({ where: { workspaceId: workspace.id } }) : [],
      workspace ? prisma.userPreference.findUnique({ where: { userId: user.id } }) : null,
    ]);

    return NextResponse.json({
      brandMemory,
      products,
      userPreference: preferences,
    });
  } catch (error) {
    console.error('Memory GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create default workspace
    let workspace = await prisma.workspace.findFirst({
      where: { userId: user.id },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          userId: user.id,
          name: 'Default Workspace',
        },
      });
    }

    const body = await req.json();

    // Validate input
    const parsed = memoryPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { type, data } = parsed.data;

    switch (type) {
      case 'brandMemory': {
        const validData = brandMemorySchema.parse(data);
        const saved = await prisma.brandMemory.upsert({
          where: { workspaceId: workspace.id },
          update: validData,
          create: { workspaceId: workspace.id, ...validData },
        });
        return NextResponse.json({ success: true, data: saved });
      }
      case 'product': {
        const validData = productSchema.parse(data);
        const saved = await prisma.product.create({
          data: { workspaceId: workspace.id, ...validData },
        });
        return NextResponse.json({ success: true, data: saved });
      }
      case 'preferences': {
        const validData = preferencesSchema.parse(data);
        const saved = await prisma.userPreference.upsert({
          where: { userId: user.id },
          update: validData,
          create: { userId: user.id, clerkId: userId, ...validData },
        });
        return NextResponse.json({ success: true, data: saved });
      }
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Memory POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }

    if (type === 'product' && id) {
      // Verify ownership
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const workspace = await prisma.workspace.findFirst({ where: { userId: user.id } });
      if (product.workspaceId !== workspace?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 });
  } catch (error) {
    console.error('Memory DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
