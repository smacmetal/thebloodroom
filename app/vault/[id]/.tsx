import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function MemoryPage() {
  const router = useRouter()
  const { id } = router.query

  const [memory, setMemory] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/vault/${id}`)
      .then(res => res.json())
      .then(data => setMemory(data))
  }, [id])

  if (!memory) return <p className="text-white p-8">Loading memory...</p>
  return (
    <main className="max-w-4xl mx-auto p-8 text-white prose prose-invert">
      <h1 className="text-3xl font-bold text-red-400">{memory.title}</h1>
      <p className="text-gray-400 italic text-sm">
        {new Date(memory.date).toLocaleString()} — by {memory.author}
      </p>
      <p className="italic text-red-300 text-sm mb-4">{memory.tags.join(', ')}</p>

      <div className="markdown-body">
        <ReactMarkdown>{memory.body}</ReactMarkdown>
      </div>

      <button
        onClick={() => router.push('/vault')}
        className="mt-6 text-sm text-red-500 hover:underline"
      >
        ← Return to Vault
      </button>
    </main>
  )
}
