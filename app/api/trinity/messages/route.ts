import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const filePath = path.resolve(process.cwd(), 'data', 'trinity', 'messages.json')

export async function GET() {
  const messages = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : []

  return NextResponse.json(messages)
}
