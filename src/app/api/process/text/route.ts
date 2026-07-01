import { NextResponse } from 'next/server';
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

    const { text, mode } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text field is required' },
        { status: 400 }
      );
    }

    const validModes = ['paraphrase', 'summarize', 'grammar', 'expand', 'simplify', 'translate_to_en', 'translate_to_zh'];
    if (!mode || !validModes.includes(mode)) {
      return NextResponse.json(
        { error: `mode must be: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }

    // Process with real AI
    const result = await processWithAi(text, mode);

    return NextResponse.json({
      result: result.content,
      provider: result.provider,
      model: result.model,
      mode,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `AI processing failed: ${e instanceof Error ? e.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
