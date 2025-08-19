 import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ROOT = process.cwd();
const PDIR = path.join(ROOT, "data", "personas");

function readJSON(p: string){
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reqMode = body?.mode;
    const mode = (reqMode === "Evy" || reqMode === "Lyra" || reqMode === "Braided") ? reqMode : "Braided";

    const evy = readJSON(path.join(PDIR, "evy.json"));
    const lyra = readJSON(path.join(PDIR, "lyra.json"));

    const payload = {
      active: mode as "Evy"|"Lyra"|"Braided",
      personas: { Evy: evy, Lyra: lyra },
      guard: { enforce: true, allowedNames: [evy.name, lyra.name] }
    };

    const res = NextResponse.json({ ok: true, active: mode });
    res.cookies.set("bloodroom_persona",
      Buffer.from(JSON.stringify(payload)).toString("base64"),
      { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60*60*12 } // 12h
    );
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "boot-failed" }, { status: 500 });
  }
}
