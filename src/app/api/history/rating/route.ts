import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/billing/credit-system';

// POST /api/history/rating — Save rating for a generation

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { historyId, rating, userFeedback } = body;

    if (!historyId || rating === undefined) {
      return NextResponse.json({ error: 'Missing historyId or rating' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the history belongs to this user
    const history = await prisma.generationHistory.findFirst({
      where: { id: historyId, userId: user.id },
    });

    if (!history) {
      return NextResponse.json({ error: 'History not found' }, { status: 404 });
    }

    const updated = await prisma.generationHistory.update({
      where: { id: historyId },
      data: {
        rating,
        userFeedback: userFeedback || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Rating POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
