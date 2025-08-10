import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const filePath = path.resolve(process.cwd(), 'data/princess/messages', 'messages.json')

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const message = {
      text: body.text,
      timestamp: body.timestamp,
      author: 'Princess',
    }

    let messages = []

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      messages = JSON.parse(data)
    }

    messages.unshift(message)

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 })
  }
}
