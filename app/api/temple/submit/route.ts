import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase"; // Corrected path to supabase
import { uploadAttachment } from "../../../lib/upload"; // Corrected path to upload

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { content, chamber, attachments, auth_id, sms } = await req.json();
  
  // Upload attachments if any
  const attachmentPromises = attachments?.map((file: any) => {
    return uploadAttachment(file, chamber); // Calls the upload function
  });

  try {
    // Wait for all uploads to complete
    const uploadedAttachments = attachmentPromises ? await Promise.all(attachmentPromises) : [];
    
    // Save message to database
    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert([
        {
          content,
          chamber,
          author: auth_id,
          attachments: uploadedAttachments,
          sms,
        },
      ]);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
