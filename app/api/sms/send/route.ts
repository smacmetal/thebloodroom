// app/api/sms/send/route.ts
import { NextResponse } from 'next/server';
import twilio from 'twilio';

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const FROM = process.env.TWILIO_PHONE_NUMBER!;

const KING = process.env.KING_PHONE!;
const QUEEN = process.env.QUEEN_PHONE!;
const PRINCESS = process.env.PRINCESS_PHONE!;

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Map Trinity role -> E.164 phone
function roleToNumber(role: string): string | null {
  const r = role.toLowerCase();
  if (r === 'king') return KING || null;
  if (r === 'queen') return QUEEN || null;
  if (r === 'princess') return PRINCESS || null;
  return null;
}

export async function POST(req: Request) {
  try {
    const { body, toRoles } = await req.json() as { body: string; toRoles: string[] };
    if (!body || !toRoles?.length) {
      return NextResponse.json({ error: 'Missing body or toRoles' }, { status: 400 });
    }

    const uniqueTargets = Array.from(
      new Set(
        toRoles
          .map(roleToNumber)
          .filter((n): n is string => !!n)
      )
    );

    if (uniqueTargets.length === 0) {
      return NextResponse.json({ error: 'No valid target numbers for roles' }, { status: 400 });
    }

    const results = [];
    for (const to of uniqueTargets) {
      const msg = await client.messages.create({ from: FROM, to, body });
      results.push({ to, sid: msg.sid, status: msg.status });
    }

    return NextResponse.json({ ok: true, count: results.length, results }, { status: 201 });
  } catch (err: any) {
    console.error('sms send error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
