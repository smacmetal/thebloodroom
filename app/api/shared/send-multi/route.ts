 import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { author, recipients, content, attachments } = await req.json();

    if (!author || !recipients || recipients.length === 0 || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Ensure recipients is always an array
    const recipientArray = Array.isArray(recipients)
      ? recipients
      : [recipients];

    const timestamp = Date.now();
    const message = {
      id: `${author}-${timestamp}`,
      author,
      recipients: recipientArray,
      content,
      attachments: attachments || [],
      timestamp,
    };

    // Save a copy of the message into each recipient’s folder
    for (const recipient of recipientArray) {
      const dirPath = path.join(
        process.cwd(),
        "data",
        recipient.toLowerCase(),
        "messages"
      );

      const filePath = path.join(dirPath, `${timestamp}.json`);

      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });

      // Write JSON file
      await fs.writeFile(filePath, JSON.stringify(message, null, 2), "utf-8");
    }

    return new Response(JSON.stringify({ success: true, message }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("[send-multi] Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send message", details: err.message }),
      { status: 500 }
    );
  }
}
