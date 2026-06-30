import { NextResponse } from 'next/server';
import { getPayment, confirmPayment, createApiKey } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      );
    }

    const payment = getPayment(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status === 'confirmed') {
      return NextResponse.json({
        status: 'confirmed',
        message: 'Payment already confirmed',
      });
    }

    // In production, this would check the blockchain for the transaction
    // For demo, we auto-confirm after creation
    const confirmed = confirmPayment(paymentId);
    
    if (confirmed) {
      const apiKey = createApiKey(confirmed.plan);
      return NextResponse.json({
        status: 'confirmed',
        apiKey: apiKey.key,
        plan: confirmed.plan,
        credits: apiKey.credits,
        message: 'Payment confirmed! Your API key is ready.',
      });
    }

    return NextResponse.json({
      status: 'pending',
      message: 'Payment not yet confirmed. Please wait.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
