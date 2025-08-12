// C:\Users\steph\thebloodroom\app\api\stats\messages\route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataRoot = path.join(process.cwd(), 'data');

const roleDirs: Record<string, string> = {
  King: path.join(dataRoot, 'king', 'messages'),
  Queen: path.join(dataRoot, 'queen', 'messages'),
  Princess: path.join(dataRoot, 'princess', 'messages'),
};

const vaultDir = path.join(dataRoot, 'memory', 'entries');

async function gather(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
    const names = (await fs.readdir(dir)).filter(n => n.toLowerCase().endsWith('.json'));
    let latest = 0;
    for (const name of names) {
      try {
        const stat = await fs.stat(path.join(dir, name));
        latest = Math.max(latest, stat.mtimeMs || stat.ctimeMs || 0);
      } catch {}
    }
    return {
      count: names.length,
      latest: latest ? new Date(latest).toISOString() : null,
    };
  } catch (e: any) {
    return { count: 0, latest: null, error: e?.message || 'err' };
  }
}

export async function GET() {
  try {
    const [king, queen, princess, vault] = await Promise.all([
      gather(roleDirs.King),
      gather(roleDirs.Queen),
      gather(roleDirs.Princess),
      gather(vaultDir),
    ]);

    return NextResponse.json({
      ok: true,
      roles: { King: king, Queen: queen, Princess: princess },
      vault,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 });
  }
}
