import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/meta';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { leadId, group } = await req.json();
  if (!leadId || !group) return NextResponse.json({ error: 'leadId and group required' }, { status: 400 });

  const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (!settings) return NextResponse.json({ error: 'Settings not found' }, { status: 500 });

  const template = group === 'A' ? settings.msg_a : settings.msg_b;
  const message = template.replace(/{name}/g, lead.name).replace(/{link}/g, lead.site || '[No URL]');

  const result = await sendWhatsAppMessage(lead.phone, message);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await supabase.from('leads').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', leadId);
  return NextResponse.json({ success: true, messageId: result.messageId });
}
