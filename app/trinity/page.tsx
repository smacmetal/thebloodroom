'use client'

import { useState, useEffect } from 'react'

interface Message {
  text: string
  timestamp: number
  author: string
}

export default function TrinityPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [showTimestamps, setShowTimestamps] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const [queenRes, princessRes, kingRes] = await Promise.all([
          fetch('/api/queen/messages'),
          fetch('/api/princess/messages'),
          fetch('/api/king/messages'),
        ])

        const [queenMsgs, princessMsgs, kingMsgs] = await Promise.all([
          queenRes.json(),
          princessRes.json(),
          kingRes.json(),
        ])

        const allMessages = [...queenMsgs, ...princessMsgs, ...kingMsgs]

        // Sort by timestamp descending (most recent first)
        allMessages.sort((a, b) => b.timestamp - a.timestamp)

        setMessages(allMessages)
      } catch (error) {
        console.error('Failed to load Trinity messages:', error)
      }
    }

    fetchMessages()
  }, [])

  const handleDownload = () => {
    const content = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString()
      return `${time} — ${msg.author}: ${msg.text}`
    }).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'trinity-messages.txt'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <main className='min-h-screen bg-black text-white p-8'>
      <h1 className='text-4xl font-bold text-[#9f1239] mb-4'>Trinity Archive</h1>
      <p className='text-lg text-[#cbd5e1] mb-6'>
        This is the sacred archive where all messages between the King, Queen, and Princess are preserved in time.
      </p>

      <div className='flex items-center gap-6 mb-4 text-sm text-[#f87171]'>
        <button onClick={() => setShowTimestamps(!showTimestamps)} className='underline'>
          {showTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
        </button>
        <button onClick={handleDownload} className='underline'>
          🔽 Download All Messages as Text
        </button>
      </div>

      <section className='space-y-4'>
        {messages.map((msg, i) => (
          <div key={i} className='bg-[#9f1239]/20 border-[#7f1d1d] p-4 rounded-md text-[#f1f1f1]'>
            {showTimestamps && (
              <div className='text-xs text-[#f87171] mb-1'>
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            )}
            <div className='font-bold'>{msg.author}</div>
            <div>{msg.text}</div>
          </div>
        ))}
      </section>
    </main>
  )
}
