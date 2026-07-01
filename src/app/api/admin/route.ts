import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin authentication (simple token)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-2024';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || ''
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action') || 'list';

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();

    if (action === 'list') {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ keys: data });
    }

    if (action === 'stats') {
      const { data, error } = await supabase
        .from('api_keys')
        .select('plan, credits');

      if (error) throw error;

      const stats = {
        total: data.length,
        byPlan: {} as Record<string, number>,
        totalCredits: 0,
      };

      data.forEach((key) => {
        stats.byPlan[key.plan] = (stats.byPlan[key.plan] || 0) + 1;
        if (key.credits > 0) stats.totalCredits += key.credits;
      });

      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token, action, ...body } = await request.json();

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();

    if (action === 'create') {
      const { key, plan, credits } = body;
      const id = crypto.randomUUID();

      const { data, error } = await supabase
        .from('api_keys')
        .insert({ id, key, plan, credits })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, key: data });
    }

    if (action === 'update') {
      const { key, credits } = body;

      const { error } = await supabase
        .from('api_keys')
        .update({ credits })
        .eq('key', key);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { key } = body;

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('key', key);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
