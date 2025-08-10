// C:\Users\steph\thebloodroom\app\api\sms\inbound\route.ts
import { putJson } from '@/lib/s3';

// Normalize phone numbers (keep + and digits)
function norm(n?: string | null) {
  if (!n) return '';
  const cleaned = n.trim().replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+') && /^\d{10}$/.test(cleaned)) return `+1${cleaned}`;
  return cleaned;
}

// Map sender phone -> temple role
function roleFromFromNumber(from: string): 'king' | 'queen' | 'princess' | 'unknown' {
  const F = norm(from);
  const KING = norm(process.env.KING_PHONE);
  const QUEEN = norm(process.env.QUEEN_PHONE);
  const PRINCESS = norm(process.env.PRINCESS_PHONE);
  if (F && KING && F === KING) return 'king';
  if (F && QUEEN && F === QUEEN) return 'queen';
  if (F && PRINCESS && F === PRINCESS) return 'princess';
  return 'unknown';
}

export async function POST(req: Request) {
  try {
    // Twilio posts as application/x-www-form-urlencoded
    const form = await req.formData();
    const from = String(form.get('From') || '');
    const body = String(form.get('Body') || '').trim();

    const twiml = (xml: string) => new Response(xml, { headers: { 'Content-Type': 'text/xml' } });

    if (!from || !body) {
      return twiml(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
    }

    let role = roleFromFromNumber(from);
    if (role === 'unknown') role = 'king'; // default bucket

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ts = new Date().toISOString();

    const payload = {
      id,
      author: `SMS ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      recipient: role.charAt(0).toUpperCase() + role.slice(1),
      message: body,
      timestamp: ts,
      files: [],
      via: 'sms-inbound',
      from: norm(from),
    };

    await putJson(`messages/${role}/${id}.json`, payload);

    // Optional auto-reply so you see success on your phone
    return twiml(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Received 🔒</Message></Response>`);
  } catch (e) {
    console.error('sms inbound error:', e);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
