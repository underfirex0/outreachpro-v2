import { NextResponse } from 'next/server';

export async function GET() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return NextResponse.json({ connected: false, status: 'Not configured' });
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (!res.ok || data.error) return NextResponse.json({ connected: false, status: data.error?.message || 'Error' });
    return NextResponse.json({ connected: true, phone: data.display_phone_number, name: data.verified_name, quality: data.quality_rating });
  } catch {
    return NextResponse.json({ connected: false, status: 'Timeout' });
  }
}
