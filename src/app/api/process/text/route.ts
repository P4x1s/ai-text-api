import { NextResponse } from 'next/server';
import { getApiKey, useCredit } from '@/lib/storage';
import { processWithAi } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const apiKeyHeader = request.headers.get('x-api-key');
    
    if (!apiKeyHeader) {
      return NextResponse.json(
        { error: 'Missing x-api-key header' },
        { status: 401 }
      );
    }

    // Verify API key format (starts with aitx_)
    if (!apiKeyHeader.startsWith('aitx_')) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      );
    }

    // Check if API key exists in database
    const apiKey = await getApiKey(apiKeyHeader);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check credits (enterprise has unlimited)
    if (apiKey.credits !== -1 && apiKey.credits <= 0) {
      return NextResponse.json(
        { error: 'No credits remaining. Please purchase more.' },
        { status: 402 }
      );
    }

    const { text, mode } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text field is required' },
        { status: 400 }
      );
    }

    // Input size limit (10KB)
    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too large. Maximum 10,000 characters.' },
        { status: 400 }
      );
    }

    const validModes = ['paraphrase', 'summarize', 'grammar', 'expand', 'simplify', 'translate_to_en', 'translate_to_zh'];
    if (!mode || !validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 400 }
      );
    }

    // Use credit (except enterprise)
    if (apiKey.credits !== -1) {
      const creditUsed = await useCredit(apiKeyHeader);
      if (!creditUsed) {
        return NextResponse.json(
          { error: 'Failed to consume credit' },
          { status: 500 }
        );
      }
    }

    // Process with real AI API
    const result = await processWithAi(text, mode);

    return NextResponse.json({
      result: result.content,
      provider: result.provider,
      model: result.model,
      mode,
      creditsRemaining: apiKey.credits === -1 ? 'unlimited' : apiKey.credits - 1,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Processing failed: ${e instanceof Error ? e.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
