import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('212')) return '+' + digits;
  if (digits.startsWith('0')) return '+212' + digits.slice(1);
  if (digits.length === 9) return '+212' + digits;
  return '+' + digits;
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { leads } = await req.json();
  if (!Array.isArray(leads) || leads.length === 0) return NextResponse.json({ error: 'No leads provided' }, { status: 400 });

  const toInsert = leads.map((l: any, i: number) => ({
    name: l.name || l.business_name || 'Unknown',
    phone: normalizePhone(l.phone || ''),
    site: l.site || l.website || null,
    group: i % 2 === 0 ? 'A' : 'B',
    status: 'unsent',
  })).filter((l: any) => l.phone.length > 8);

  const { data, error } = await supabase.from('leads').insert(toInsert).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data?.length || 0 });
}
