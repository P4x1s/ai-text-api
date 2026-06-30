import { NextResponse } from 'next/server';
import { createPayment, PLANS } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();
    
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose: starter, pro, enterprise' },
        { status: 400 }
      );
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];
    const payment = createPayment(plan, planInfo.price);

    return NextResponse.json({
      paymentId: payment.id,
      address: payment.address,
      amount: payment.amount,
      currency: 'USDT',
      network: 'TRC20',
      plan: planInfo.name,
      instructions: `Send exactly ${planInfo.price} USDT (TRC20) to the address above. Payment is automatically verified.`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
