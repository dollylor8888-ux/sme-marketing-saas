import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/billing/credit-system';

// GET /api/history — Get generation history

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const skill = searchParams.get('skill');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const where = skill ? { userId: user.id, skill } : { userId: user.id };

    const [history, total] = await Promise.all([
      prisma.generationHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.generationHistory.count({ where }),
    ]);

    // Parse JSON strings back to objects
    const parsedHistory = history.map(h => ({
      ...h,
      inputData: JSON.parse(h.inputData),
      generatedContent: JSON.parse(h.generatedContent),
    }));

    return NextResponse.json({ history: parsedHistory, total, limit, offset });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
