import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  const dir = path.join(process.cwd(), 'app/vault')
  const files = await fs.readdir(dir)
  const memories = []

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const filePath = path.join(dir, file)
    const content = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(content)
    memories.push({
      id: file.replace('.json', ''),
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      author: data.author || 'Unknown',
      status: data.status || 'active'
    })
  }

  return NextResponse.json({ memories })
}
