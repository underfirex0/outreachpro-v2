import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendWhatsAppMessage, getClaudeReply, BOT_SYSTEM_PROMPT } from '@/lib/meta';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'outreachpro-secret';

function mapStatus(botStatus: string): string {
  const map: Record<string, string> = {
    cold: 'not-interested', warm: 'replied',
    hot: 'interested', booked: 'interested', human_takeover: 'replied',
  };
  return map[botStatus] || 'replied';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ status: 'ok' }); }

  try {
    const value = body.entry?.[0]?.changes?.[0]?.value;
    if (!value) return NextResponse.json({ status: 'ok' });
    if (value.statuses) return NextResponse.json({ status: 'ok' }); // ignore delivery receipts

    const msg = value.messages?.[0];
    if (!msg || msg.type !== 'text') return NextResponse.json({ status: 'ok' });

    const fromPhone = msg.from;
    const messageText = msg.text.body;
    console.log(`[WEBHOOK] ${fromPhone}: ${messageText}`);

    // Find lead
    const last9 = fromPhone.slice(-9);
    const { data: leads } = await supabase.from('leads').select('*').ilike('phone', `%${last9}`);
    const lead = leads?.[0] || null;

    // Save incoming message
    await supabase.from('conversations').insert({ phone: fromPhone, role: 'user', message: messageText });

    // Get history
    const { data: history } = await supabase
      .from('conversations').select('role, message')
      .eq('phone', fromPhone).order('created_at', { ascending: true }).limit(10);

    const messages = (history || []).map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.message }));

    // Get Claude reply
    const systemPrompt = BOT_SYSTEM_PROMPT + (lead ? `\n\nLead: ${lead.name}, Site: ${lead.site || 'aucun'}` : '');
    const { reply, status } = await getClaudeReply(messages, lead, systemPrompt);
    console.log(`[WEBHOOK] Reply: ${reply} | Status: ${status}`);

    // Save bot reply
    await supabase.from('conversations').insert({ phone: fromPhone, role: 'assistant', message: reply });

    // Update lead CRM
    if (lead) {
      await supabase.from('leads').update({ status: mapStatus(status), replied_at: new Date().toISOString() }).eq('id', lead.id);
    }

    // Send reply
    const result = await sendWhatsAppMessage(fromPhone, reply);
    console.log(`[WEBHOOK] Send result:`, result);

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('[WEBHOOK ERROR]', err.message);
    return NextResponse.json({ status: 'ok' });
  }
}
