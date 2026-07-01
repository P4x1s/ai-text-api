const TRONGRID_API = 'https://api.trongrid.io';

export interface Trc20Transfer {
  transaction_id: string;
  token_info: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  from: string;
  to: string;
  value: string;
  block_timestamp: number;
}

export interface VerifyResult {
  confirmed: boolean;
  txHash?: string;
  amount?: number;
  error?: string;
}

// USDT TRC20 contract address
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

// TRC20 value is in smallest unit (6 decimals for USDT)
function trc20ValueToNumber(value: string, decimals: number): number {
  const divisor = Math.pow(10, decimals);
  return parseInt(value, 10) / divisor;
}

/**
 * Verify a USDT TRC20 payment on the TRON blockchain
 * @param fromAddress - The sender's address (user's wallet)
 * @param toAddress - Your receiving address
 * @param expectedAmount - Expected USDT amount
 * @param withinMinutes - Check transactions within last N minutes (default 60)
 * @param apiKey - TronGrid API key (optional, for higher rate limits)
 */
export async function verifyUsdtPayment(
  fromAddress: string,
  toAddress: string,
  expectedAmount: number,
  withinMinutes: number = 60,
  apiKey?: string
): Promise<VerifyResult> {
  try {
    const minTimestamp = Date.now() - withinMinutes * 60 * 1000;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (apiKey) {
      headers['TRON-PRO-API-KEY'] = apiKey;
    }

    // Query TRC20 transfers to our address
    const url = `${TRONGRID_API}/v1/accounts/${toAddress}/transactions/trc20?only_to=true&limit=50&min_timestamp=${minTimestamp}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      return { confirmed: false, error: `TronGrid API error: ${response.status}` };
    }

    const data = await response.json();
    const transfers: Trc20Transfer[] = data.data || [];

    // Find matching USDT transfer
    for (const transfer of transfers) {
      // Check if it's USDT
      if (transfer.token_info.address.toLowerCase() !== USDT_CONTRACT.toLowerCase()) {
        continue;
      }

      // Check if from the expected sender
      if (transfer.from.toLowerCase() !== fromAddress.toLowerCase()) {
        continue;
      }

      // Check amount
      const amount = trc20ValueToNumber(transfer.value, transfer.token_info.decimals);
      
      if (Math.abs(amount - expectedAmount) < 0.001) {
        return {
          confirmed: true,
          txHash: transfer.transaction_id,
          amount,
        };
      }
    }

    return { confirmed: false, error: 'No matching payment found' };
  } catch (err) {
    return { 
      confirmed: false, 
      error: `Verification failed: ${err instanceof Error ? err.message : 'Unknown error'}` 
    };
  }
}

/**
 * Check if an address is a valid TRON address
 */
export function isValidTronAddress(address: string): boolean {
  return /^T[A-Za-z0-9]{33}$/.test(address);
}
