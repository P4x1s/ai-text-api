import { NextResponse } from 'next/server';
import { createApiKey, PLANS } from '@/lib/storage';
import { verifyUsdtPayment, isValidTronAddress } from '@/lib/tron';

// Your TRON wallet address
const MY_TRON_ADDRESS = process.env.MY_TRON_ADDRESS || 'TBfAn71a2GjcpGtd5noRAE59QnvkEj7uME';
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY || '';
const TEST_MODE = process.env.TEST_MODE === 'true';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderAddress = searchParams.get('senderAddress');
    const plan = searchParams.get('plan');
    
    if (!senderAddress) {
      return NextResponse.json(
        { error: 'senderAddress is required' },
        { status: 400 }
      );
    }

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { error: 'plan is required (trial, starter, pro, enterprise)' },
        { status: 400 }
      );
    }

    if (!isValidTronAddress(senderAddress)) {
      return NextResponse.json(
        { error: 'Invalid TRON address format. Must start with T and be 34 characters.' },
        { status: 400 }
      );
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];

    // Skip blockchain verification in test mode
    if (!TEST_MODE) {
      // Verify on blockchain using TronGrid API
      const result = await verifyUsdtPayment(
        senderAddress,
        MY_TRON_ADDRESS,
        planInfo.price,
        60, // within last 60 minutes
        TRONGRID_API_KEY
      );

      if (!result.confirmed) {
        return NextResponse.json({
          status: 'pending',
          message: result.error || 'Payment not yet confirmed on blockchain. Please wait a few minutes and try again.',
        });
      }
    }

    // Payment verified (or test mode), generate API key
    const apiKey = await createApiKey(plan);
    
    return NextResponse.json({
      status: 'confirmed',
      apiKey: apiKey.key,
      txHash: TEST_MODE ? 'test-mode-transaction' : undefined,
      plan: plan,
      planName: planInfo.name,
      credits: apiKey.credits,
      message: 'Payment confirmed! Your API key is ready.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
