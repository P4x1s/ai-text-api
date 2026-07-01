import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialize Supabase client
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

export interface ApiKey {
  id: string;
  key: string;
  plan: string;
  credits: number;
  created_at: string;
}

export const PLANS = {
  trial: { price: 1, credits: 500, name: 'Trial' },
  starter: { price: 5, credits: 10000, name: 'Starter' },
  pro: { price: 20, credits: 200000, name: 'Pro' },
  enterprise: { price: 100, credits: -1, name: 'Enterprise' },
} as const;

export async function createApiKey(plan: string): Promise<ApiKey> {
  const client = getSupabase();
  const id = crypto.randomUUID();
  const key = 'aitx_' + crypto.randomUUID().replace(/-/g, '');
  const credits = PLANS[plan as keyof typeof PLANS]?.credits || 0;

  const { data, error } = await client
    .from('api_keys')
    .insert({
      id,
      key,
      plan,
      credits,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error('Failed to create API key');
  }

  return data;
}

export async function getApiKey(key: string): Promise<ApiKey | null> {
  const client = getSupabase();
  
  const { data, error } = await client
    .from('api_keys')
    .select('*')
    .eq('key', key)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function useCredit(key: string): Promise<boolean> {
  const apiKey = await getApiKey(key);
  if (!apiKey) return false;

  // Enterprise has unlimited credits
  if (apiKey.credits === -1) return true;

  if (apiKey.credits > 0) {
    const client = getSupabase();
    const { error } = await client
      .from('api_keys')
      .update({ credits: apiKey.credits - 1 })
      .eq('key', key);

    if (error) {
      console.error('Supabase update error:', error);
      return false;
    }
    return true;
  }

  return false;
}
