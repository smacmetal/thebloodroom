 // C:\Users\steph\thebloodroom\app\lib\twilio.ts
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const roleNumbers: Record<string, string> = {
  king: process.env.TWILIO_KING_NUMBER!,
  queen: process.env.TWILIO_QUEEN_NUMBER!,
  princess: process.env.TWILIO_PRINCESS_NUMBER!,
};

/**
 * Send an SMS to a role (King, Queen, Princess).
 * Falls back gracefully if no number is configured.
 */
export async function sendSmsToRole(role: string, message: string) {
  const to = roleNumbers[role.toLowerCase()];
  if (!to) {
    console.warn(`[twilio] No phone number configured for role: ${role}`);
    return;
  }

  await client.messages.create({
    from: process.env.TWILIO_BLOODROOM_NUMBER!,
    to,
    body: message,
  });
}
