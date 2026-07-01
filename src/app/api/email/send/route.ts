import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { email, apiKey, plan, credits } = await request.json();
    
    if (!email || !apiKey) {
      return NextResponse.json(
        { error: 'email and apiKey are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured. RESEND_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'AI CFSSR <noreply@cfssr.cf>',
      to: email,
      subject: 'Your AI CFSSR API Key',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; line-height: 48px; font-size: 20px; font-weight: bold; color: white;">AI</div>
            </div>
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; text-align: center;">Your API Key is Ready!</h1>
            <p style="color: #9ca3af; text-align: center; margin-bottom: 32px;">Thank you for purchasing the ${plan} plan.</p>
            
            <div style="background-color: #111827; border: 1px solid #374151; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 8px;">Your API Key:</p>
              <p style="font-family: monospace; font-size: 14px; word-break: break-all; background-color: #1f2937; padding: 12px; border-radius: 8px; margin: 0;">${apiKey}</p>
            </div>

            <div style="background-color: #111827; border: 1px solid #374151; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 8px;">Plan: <strong style="color: #f9fafb;">${plan}</strong></p>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">Credits: <strong style="color: #10b981;">${credits}</strong></p>
            </div>

            <div style="background-color: #111827; border: 1px solid #374151; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">Quick Start:</p>
              <pre style="background-color: #1f2937; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto; margin: 0; color: #e5e7eb;">curl -X POST https://cfssr.cf/api/process/text \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{"text": "Hello world", "mode": "paraphrase"}'</pre>
            </div>

            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Keep this email for your records. Do not share your API key.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return NextResponse.json(
        { error: `Resend error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    return NextResponse.json(
      { error: `Internal error: ${e instanceof Error ? e.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
