import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    let plan: string | undefined;
    
    try {
      const body = JSON.parse(text);
      plan = body.plan;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose: starter, pro, enterprise' },
        { status: 400 }
      );
    }

    const MY_TRON_ADDRESS = process.env.MY_TRON_ADDRESS;
    if (!MY_TRON_ADDRESS) {
      return NextResponse.json(
        { error: 'Payment system not configured.' },
        { status: 500 }
      );
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];

    return NextResponse.json({
      address: MY_TRON_ADDRESS,
      amount: planInfo.price,
      currency: 'USDT',
      network: 'TRC20',
      plan: plan,
      planName: planInfo.name,
      credits: planInfo.credits,
      instructions: `Send exactly ${planInfo.price} USDT (TRC20) to the address above.`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error', details: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
