import { randomBytes, createHash } from 'crypto';

export interface ApiKey {
  id: string;
  key: string;
  plan: string;
  credits: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  address: string;
  amount: number;
  plan: string;
  status: 'pending' | 'confirmed' | 'expired';
  createdAt: string;
}

const apiKeys = new Map<string, ApiKey>();
const payments = new Map<string, Payment>();

export function generateAddress(): string {
  const hash = createHash('sha256')
    .update(randomBytes(32))
    .digest('hex');
  return 'T' + hash.slice(0, 33);
}

export function createPayment(plan: string, amount: number): Payment {
  const id = randomBytes(16).toString('hex');
  const address = generateAddress();
  const payment: Payment = {
    id,
    address,
    amount,
    plan,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  payments.set(id, payment);
  return payment;
}

export function getPayment(id: string): Payment | undefined {
  return payments.get(id);
}

export function confirmPayment(id: string): Payment | undefined {
  const payment = payments.get(id);
  if (payment) {
    payment.status = 'confirmed';
    payments.set(id, payment);
  }
  return payment;
}

export function createApiKey(plan: string): ApiKey {
  const id = randomBytes(16).toString('hex');
  const key = 'aitx_' + randomBytes(32).toString('hex');
  const credits = plan === 'starter' ? 1000 : plan === 'pro' ? 10000 : 100000;
  const apiKey: ApiKey = {
    id,
    key,
    plan,
    credits,
    createdAt: new Date().toISOString(),
  };
  apiKeys.set(key, apiKey);
  return apiKey;
}

export function getApiKey(key: string): ApiKey | undefined {
  return apiKeys.get(key);
}

export function consumeCredit(key: string): boolean {
  const apiKey = apiKeys.get(key);
  if (apiKey && apiKey.credits > 0) {
    apiKey.credits -= 1;
    apiKeys.set(key, apiKey);
    return true;
  }
  return false;
}

export const PLANS = {
  trial: { price: 1, credits: 500, name: 'Trial' },
  starter: { price: 5, credits: 10000, name: 'Starter' },
  pro: { price: 20, credits: 200000, name: 'Pro' },
  enterprise: { price: 100, credits: -1, name: 'Enterprise' },
} as const;
