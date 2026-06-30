import { NextResponse } from 'next/server';
import { getPayment, confirmPayment, createApiKey } from '@/lib/storage';
import { verifyUsdtPayment, isValidTronAddress } from '@/lib/tron';

// Your TRON wallet address
const MY_TRON_ADDRESS = process.env.MY_TRON_ADDRESS || 'TBfAn71a2GjcpGtd5noRAE59QnvkEj7uME';
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const senderAddress = searchParams.get('senderAddress');
    
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

    // If sender address is provided, verify on blockchain
    if (senderAddress) {
      if (!isValidTronAddress(senderAddress)) {
        return NextResponse.json(
          { error: 'Invalid TRON address format' },
          { status: 400 }
        );
      }

      // Verify on blockchain using TronGrid API
      const result = await verifyUsdtPayment(
        senderAddress,
        MY_TRON_ADDRESS,
        payment.amount,
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

    // Confirm payment and generate API key
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
