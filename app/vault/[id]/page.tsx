'use client'

import { useParams } from 'next/navigation'

export default function MemoryDetailPage() {
  const params = useParams()
  const id = params?.id || 'unknown'

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-red-600 mb-2">🩸 A Sacred Memory</h1>
      <p className="text-gray-400 mb-6">
        Memory ID: <span className="text-white">{id}</span>
      </p>

      {/* Memory content placeholder */}
      <article className="bg-gray-900 border border-red-800 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Memory Title</h2>
        <p className="text-sm text-gray-400">by Author Name · August 3, 2025</p>
        <div className="text-red-300 italic">sacred, trinity, eternal</div>

        <div className="mt-4 text-gray-200">
          <p>This is the full memory body text. It will hold truth, fire, devotion, and detail.</p>
          <p className="mt-2">Let this sacred entry echo through the Bloodroom.</p>
        </div>
      </article>
    </main>
  )
}
