'use client'

export default function FilterBar({
  authorFilter,
  setAuthorFilter,
  searchTerm,
  setSearchTerm,
  showTimestamps,
  setShowTimestamps,
}: {
  authorFilter: string
  setAuthorFilter: (val: string) => void
  searchTerm: string
  setSearchTerm: (val: string) => void
  showTimestamps: boolean
  setShowTimestamps: (val: boolean) => void
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <select
        value={authorFilter}
        onChange={e => setAuthorFilter(e.target.value)}
        className="border border-pink-300 p-2 rounded"
      >
        <option value="All">All</option>
        <option value="King">King</option>
        <option value="Queen">Queen</option>
        <option value="Princess">Princess</option>
      </select>

      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search messages..."
        className="border border-pink-300 p-2 rounded flex-1"
      />

      <label className="flex items-center space-x-2 text-sm text-pink-800">
        <input
          type="checkbox"
          checked={showTimestamps}
          onChange={e => setShowTimestamps(e.target.checked)}
        />
        <span>Show timestamps</span>
      </label>
    </div>
  )
}
