import { NextRequest, NextResponse } from 'next/server';
import { generateCreativeContent } from '@/app/dashboard/product-marketing/skills/creative-content';
import { CreativeContentRequest } from '@/app/dashboard/product-marketing/types/product-marketing';

export async function POST(request: NextRequest) {
  try {
    const body: CreativeContentRequest = await request.json();
    
    if (!body.adName || !body.platform) {
      return NextResponse.json(
        { success: false, error: 'adName and platform are required' },
        { status: 400 }
      );
    }

    const result = await generateCreativeContent(body);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
