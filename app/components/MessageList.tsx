'use client'

import React from 'react'

export default function MessageList({
  messages,
  authorFilter,
  searchTerm,
  showTimestamps,
  onDelete,
}: {
  messages: any[]
  authorFilter: string
  searchTerm: string
  showTimestamps: boolean
  onDelete: (filename: string) => void
}) {
  const filtered = messages.filter(msg => {
    const matchesAuthor = authorFilter === 'All' || msg.author === authorFilter
    const matchesSearch = msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAuthor && matchesSearch
  })

  return (
    <ul className="space-y-4">
      {filtered.map((msg, idx) => (
        <li key={msg.filename || idx} className="p-4 border border-pink-300 rounded bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-800 font-semibold">{msg.author}</p>
              <p className="text-gray-800">{msg.content}</p>
              {showTimestamps && (
                <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(msg.filename)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
