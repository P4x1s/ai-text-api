const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiResponse {
  content: string;
  provider: string;
  model: string;
}

// OpenAI / compatible APIs (OpenAI, DeepSeek, etc.)
async function callOpenAiCompatible(
  messages: AiMessage[],
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<AiResponse> {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openai-compatible',
    model,
  };
}

// Anthropic Claude
async function callClaude(
  messages: AiMessage[],
  apiKey: string,
  model: string
): Promise<AiResponse> {
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemMsg?.content || '',
      messages: userMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    provider: 'anthropic',
    model,
  };
}

export async function processWithAi(
  text: string,
  mode: string,
  customPrompt?: string
): Promise<AiResponse> {
  const systemPrompt = `You are a professional text processing AI. Process the following text according to the user's request. Be concise and accurate.`;

  const modePrompts: Record<string, string> = {
    paraphrase: `Paraphrase the following text in a different way while keeping the same meaning:`,
    summarize: `Summarize the following text to its key points:`,
    grammar: `Fix all grammar and spelling errors in the following text:`,
    expand: `Expand the following text with more detail and depth:`,
    simplify: `Simplify the following text to make it easier to understand:`,
    translate_to_en: `Translate the following text to English:`,
    translate_to_zh: `Translate the following text to Chinese:`,
  };

  const userPrompt = `${modePrompts[mode] || customPrompt || 'Process the following text:'}\n\n${text}`;

  const messages: AiMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  // Route to the appropriate AI provider
  switch (AI_PROVIDER) {
    case 'openai':
      return callOpenAiCompatible(
        messages,
        process.env.OPENAI_API_KEY || '',
        process.env.OPENAI_BASE_URL || 'https://api.openai.com',
        process.env.OPENAI_MODEL || 'gpt-4o-mini'
      );

    case 'deepseek':
      return callOpenAiCompatible(
        messages,
        process.env.DEEPSEEK_API_KEY || '',
        'https://api.deepseek.com',
        process.env.DEEPSEEK_MODEL || 'deepseek-chat'
      );

    case 'qwen':
      return callOpenAiCompatible(
        messages,
        process.env.QWEN_API_KEY || '',
        process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode',
        process.env.QWEN_MODEL || 'qwen-plus'
      );

    case 'doubao':
      return callOpenAiCompatible(
        messages,
        process.env.DOUBAO_API_KEY || '',
        process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
        process.env.DOUBAO_MODEL || 'doubao-pro-4k'
      );

    case 'claude':
      return callClaude(
        messages,
        process.env.ANTHROPIC_API_KEY || '',
        process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307'
      );

    case 'mimo':
      return callOpenAiCompatible(
        messages,
        process.env.MIMO_API_KEY || '',
        process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
        process.env.MIMO_MODEL || 'mimo-v2.5'
      );

    default:
      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
  }
}
