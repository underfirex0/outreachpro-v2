import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createServiceClient();
  const { data: leads } = await supabase.from('leads').select('status, group');
  if (!leads) return NextResponse.json({});

  const stats = {
    total: leads.length,
    unsent: leads.filter(l => l.status === 'unsent').length,
    sent: leads.filter(l => l.status === 'sent').length,
    replied: leads.filter(l => l.status === 'replied').length,
    interested: leads.filter(l => l.status === 'interested').length,
    not_interested: leads.filter(l => l.status === 'not-interested').length,
    not_sure: leads.filter(l => l.status === 'not-sure').length,
    group_a: leads.filter(l => l.group === 'A').length,
    group_b: leads.filter(l => l.group === 'B').length,
    a_sent: leads.filter(l => l.group === 'A' && ['sent','replied','interested','not-interested','not-sure'].includes(l.status)).length,
    b_sent: leads.filter(l => l.group === 'B' && ['sent','replied','interested','not-interested','not-sure'].includes(l.status)).length,
    a_interested: leads.filter(l => l.group === 'A' && l.status === 'interested').length,
    b_interested: leads.filter(l => l.group === 'B' && l.status === 'interested').length,
  };

  return NextResponse.json(stats);
}
