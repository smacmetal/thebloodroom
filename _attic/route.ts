import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const data = await req.json()

  const timestamp = new Date().toISOString()
  const filename = `${timestamp}.json`
  const dir = path.join(process.cwd(), 'data', 'princess', 'messages')
  const filepath = path.join(dir, filename)

  try {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true, message: 'Saved' })
  } catch (error) {
    console.error('Error writing file:', error)
    return NextResponse.json({ success: false, error: 'Failed to save' })
  }
}

export async function GET() {
  const dir = path.join(process.cwd(), 'data', 'princess', 'messages')

  try {
    const files = fs.readdirSync(dir)
    const messages = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const content = fs.readFileSync(path.join(dir, f), 'utf-8')
        return JSON.parse(content)
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error reading messages:', error)
    return NextResponse.json([])
  }
}
