import { NextResponse } from 'next/server';
import { getApiKey } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'key parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey(key);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      plan: apiKey.plan,
      credits: apiKey.credits,
      createdAt: apiKey.createdAt,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
