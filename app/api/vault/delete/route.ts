import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// DELETE handler — deletes a single message file by role and filename
export async function DELETE(req: NextRequest) {
  try {
    const { role, filename } = await req.json()

    if (!role || !filename) {
      return NextResponse.json({ error: 'Missing role or filename' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), `data/${role}/messages`, filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Optional: POST handler for Princess message saving
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const message = {
      text: body.text,
      timestamp: body.timestamp,
      author: 'Princess',
    }

    const filePath = path.resolve(process.cwd(), 'data/princess/messages/messages.json')

    let messages = []

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      messages = JSON.parse(data)
    }

    messages.unshift(message)

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Save error:', err)
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 })
  }
}
