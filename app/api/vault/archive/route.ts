 import { NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const author = formData.get("author") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await uploadToS3(file, `vault/${author}/${Date.now()}-${file.name}`);
    }

    const entry = {
      author,
      content,
      imageUrl,
      archivedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("Vault archive error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
