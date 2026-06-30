import { NextResponse } from 'next/server';
import { createPayment, PLANS } from '@/lib/storage';

// Your TRON wallet address for receiving payments
const MY_TRON_ADDRESS = process.env.MY_TRON_ADDRESS || '';

export async function POST(request: Request) {
  try {
    const { plan, senderAddress } = await request.json();
    
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose: starter, pro, enterprise' },
        { status: 400 }
      );
    }

    if (!MY_TRON_ADDRESS) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please set MY_TRON_ADDRESS.' },
        { status: 500 }
      );
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];
    const payment = createPayment(plan, planInfo.price);

    return NextResponse.json({
      paymentId: payment.id,
      address: MY_TRON_ADDRESS, // Your receiving address
      amount: payment.amount,
      currency: 'USDT',
      network: 'TRC20',
      plan: planInfo.name,
      senderAddress: senderAddress || null,
      instructions: `Send exactly ${planInfo.price} USDT (TRC20) to the address above. After payment, verify with your TRON wallet address.`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
