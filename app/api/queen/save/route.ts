import { writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const message = await req.json()
  const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}.json`

  const filePath = path.join(process.cwd(), 'data', '[queen]', 'messages', fileName)

  await writeFile(filePath, JSON.stringify(message, null, 2))

  return NextResponse.json({ success: true })
}
