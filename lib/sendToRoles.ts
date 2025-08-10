// C:\Users\steph\thebloodroom\lib\sendToRoles.ts

import { putJson } from '@/lib/s3';

interface MessagePayload {
  text: string;
  author: string;
  timestamp: string;
}

export async function sendToRoles(
  message: MessagePayload,
  recipients: string[]
): Promise<void> {
  await Promise.all(
    recipients.map(async (role) => {
      // Store in S3 under: messages/<role>/<timestamp>.json
      const key = `messages/${role.toLowerCase()}/${message.timestamp}.json`;
      await putJson(key, message);
    })
  );
}
