import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeProduct } from '@/app/dashboard/product-marketing/skills/product-analysis';
import { ProductAnalysisRequest } from '@/app/dashboard/product-marketing/types/product-marketing';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProductAnalysisRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await analyzeProduct(body);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
