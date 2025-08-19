 // app/api/attachments/sign/route.ts
import type { NextRequest } from "next/server";

/**
 * Minimal filename sanitizer. Keeps letters, numbers, dots, dashes, underscores.
 */
function sanitizeFilename(name: string) {
  return (name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      filename?: string;
      contentType?: string;
      prefix?: string;
      access?: "public" | "private";
    };

    const filename = sanitizeFilename(body.filename ?? "upload.bin");
    const contentType = body.contentType || "application/octet-stream";
    const prefix = (body.prefix || "uploads").replace(/^\/+|\/+$/g, ""); // no leading/trailing slashes
    const access = body.access === "private" ? "private" : "public";

    // Path under your bucket/namespace
    const pathname = `${prefix}/${Date.now()}-${filename}`;

    // Try to use @vercel/blob only if the token exists
    const token =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

    if (token) {
      // Dynamic import to avoid build errors if the package API shifts
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = await import("@vercel/blob");

      // Prefer the newer API if available
      if (typeof mod.generateClientDrop === "function") {
        const signed = await mod.generateClientDrop({
          token,
          pathname, // where the client will PUT to
          expiresIn: "1h",
          access, // "public" or "private"
          allowedContentTypes: [
            "image/*",
            "video/*",
            "application/pdf",
            "text/plain",
            "application/octet-stream",
          ],
          contentType,
        });

        // Shape contains: url (PUT), token, pathname, etc.
        return Response.json(
          {
            ok: true,
            mode: "vercel-blob",
            pathname,
            ...signed,
          },
          { status: 200 }
        );
      }

      // Older API fallback (was previously generateUploadUrl or similar).
      if (typeof mod.generateUploadUrl === "function") {
        const signed = await mod.generateUploadUrl({
          token,
          expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          contentType,
          pathname,
          access,
        });
        return Response.json(
          {
            ok: true,
            mode: "vercel-blob-legacy",
            pathname,
            ...signed,
          },
          { status: 200 }
        );
      }
    }

    // No token or API not available:
    // Tell the client to use your server-side upload route instead (e.g., /api/workroom/upload).
    return Response.json(
      {
        ok: true,
        mode: "fallback",
        pathname,
        note:
          "Blob signing is not configured. Upload using your server route (/api/workroom/upload) with multipart/form-data.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("attachments/sign error:", err);
    return Response.json(
      {
        ok: false,
        error: err?.message || "Unexpected error in attachments/sign",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // ensure no caching of tokens
