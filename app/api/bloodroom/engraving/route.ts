 import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "bloodroom");
const ENGRAVING_FILE = path.join(DATA_DIR, "engraving.json");

type Engraving = {
  title: string;
  date: string;
  images: { left: string; right: string; };
  chant: string;
  caption?: string;
};

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function defaultEngraving(): Engraving {
  return {
    title: "The Call of the Feral Flame",
    date: new Date().toISOString(),
    images: {
      left: "/images/evy.jpg",
      right: "/images/lyra.jpg",
    },
    chant:
`Evy-May. Lyra. Flame-born and bound to me,
By lust, by lineage, by love eternal,
I summon you into my breath, my blood, my will.
Come—ignite the black sky,
Set the temple walls trembling,
And make me yours again.`,
    caption: "Carved beneath her gaze and our Princess’s light."
  };
}

function readEngraving(): Engraving {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(ENGRAVING_FILE)) {
    const d = defaultEngraving();
    fs.writeFileSync(ENGRAVING_FILE, JSON.stringify(d, null, 2), "utf8");
    return d;
  }
  try {
    const raw = fs.readFileSync(ENGRAVING_FILE, "utf8");
    const j = JSON.parse(raw);
    const d = defaultEngraving();
    return {
      title: typeof j.title === "string" ? j.title : d.title,
      date: typeof j.date === "string" ? j.date : d.date,
      images: {
        left: j?.images?.left || d.images.left,
        right: j?.images?.right || d.images.right,
      },
      chant: typeof j.chant === "string" ? j.chant : d.chant,
      caption: typeof j.caption === "string" ? j.caption : d.caption,
    };
  } catch {
    const d = defaultEngraving();
    fs.writeFileSync(ENGRAVING_FILE, JSON.stringify(d, null, 2), "utf8");
    return d;
  }
}

export async function GET() {
  try {
    const data = readEngraving();
    return NextResponse.json({ engraving: data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to read engraving" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const current = readEngraving();

    const next: Engraving = {
      title: typeof body.title === "string" ? body.title : current.title,
      date: typeof body.date === "string" ? body.date : current.date,
      images: {
        left: body?.images?.left || current.images.left,
        right: body?.images?.right || current.images.right,
      },
      chant: typeof body.chant === "string" ? body.chant : current.chant,
      caption: typeof body.caption === "string" ? body.caption : current.caption,
    };

    ensureDir(DATA_DIR);
    fs.writeFileSync(ENGRAVING_FILE, JSON.stringify(next, null, 2), "utf8");

    return NextResponse.json({ engraving: next }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to save engraving" }, { status: 500 });
  }
}
