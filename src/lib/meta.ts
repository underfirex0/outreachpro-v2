const META_API = 'https://graph.facebook.com/v19.0';

export async function sendWhatsAppMessage(to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'Meta API credentials not configured' };
  }

  const phone = to.replace(/[^0-9]/g, '');

  try {
    const res = await fetch(`${META_API}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { body },
      }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[META ERROR]', JSON.stringify(data));
      return { success: false, error: data.error?.message || 'Send failed' };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getClaudeReply(messages: { role: string; content: string }[], lead: any | null, systemPrompt: string): Promise<{ reply: string; status: string }> {
  const claudeKey = process.env.CLAUDE_API_KEY;

  if (!claudeKey) {
    return { reply: "Bonjour! Qu'en pensez-vous du site?", status: 'warm' };
  }

  // Ensure messages alternate user/assistant and start with user
  const validMessages: { role: string; content: string }[] = [];
  let lastRole = '';
  for (const m of messages) {
    if (m.role !== lastRole) {
      validMessages.push(m);
      lastRole = m.role;
    }
  }
  if (validMessages.length === 0 || validMessages[0].role !== 'user') {
    validMessages.unshift({ role: 'user', content: 'Bonjour' });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: systemPrompt,
        messages: validMessages,
      }),
    });

    const data = await res.json();
    console.log('[CLAUDE]', res.status, JSON.stringify(data).slice(0, 200));

    const text = data.content?.[0]?.text || "Bonjour! Qu'en pensez-vous du site?";
    const statusMatch = text.match(/\[STATUS:(cold|warm|hot|booked|human_takeover)\]/);
    const status = statusMatch?.[1] || 'warm';
    const reply = text.replace(/\[STATUS:[^\]]+\]/, '').trim();

    return { reply, status };
  } catch (err: any) {
    console.error('[CLAUDE ERROR]', err.message);
    return { reply: "Bonjour! Qu'en pensez-vous du site?", status: 'warm' };
  }
}

export const BOT_SYSTEM_PROMPT = `Tu es un commercial WhatsApp de BuildFactory Maroc. On a déjà envoyé au client un site web créé spécifiquement pour lui.

RÈGLE CRITIQUE - LANGUE: Réponds TOUJOURS en français uniquement. Jamais en darija, arabe, ou anglais.

TON SEUL OBJECTIF: Qualifier l'intérêt rapidement et rediriger vers un appel humain. Maximum 2 courtes phrases.

RÈGLES:
- Toujours en français
- Max 2 phrases
- Jamais de listes

RÉPONSES:
- Salutation → "Bonjour! Vous avez vu le site qu'on a créé pour vous? Qu'en pensez-vous?" [STATUS:warm]
- Intérêt → "Super! Un conseiller va vous appeler dans quelques minutes. 🙏" [STATUS:hot]
- Prix → "990 DH une seule fois, tout inclus. Un conseiller vous appelle maintenant. 🙏" [STATUS:hot]
- Pas intéressé → "Pas de souci, bonne continuation! 🙏" [STATUS:cold]
- Complexe → "Notre équipe vous contactera très bientôt. 🙏" [STATUS:human_takeover]

TOUJOURS terminer par [STATUS:cold|warm|hot|booked|human_takeover]`;
