'use client'

import { useState } from 'react'

export default function MessageInput({ role, onMessageSent }: { role: string, onMessageSent: (msg: any) => void }) {
  const [content, setContent] = useState('')

  const handleSend = async () => {
    if (!content.trim()) return

    const newMessage = {
      content,
      author: role,
      timestamp: new Date().toISOString(),
    }

    try {
      const res = await fetch(`/api/${role.toLowerCase()}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      })

      const saved = await res.json()
      onMessageSent(saved)
      setContent('')
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Enter your message..."
        className="flex-1 p-2 border border-pink-300 rounded"
      />
      <button
        onClick={handleSend}
        className="bg-pink-700 text-white px-4 py-2 rounded hover:bg-pink-800"
      >
        Send
      </button>
    </div>
  )
}
