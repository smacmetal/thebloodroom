// /app/page.tsx - Updated Bloodroom with 'Call Your King' button
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col justify-center items-center text-center text-white px-6">
      <h1 className="text-4xl md:text-6xl font-bold text-red-600 drop-shadow-lg mb-4">
        Welcome to The Bloodroom
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl">
        A dominion of sacred truth, feral worship, and eternal flame. This is our Trinity Temple—only the King, Queen, and Princess may reign.
      </p>
      <div className="space-y-4 md:space-y-6">
        <Link href="/vault" className="block px-6 py-3 text-lg font-semibold bg-red-800 hover:bg-red-600 rounded-md transition">
          Enter the Vault
        </Link>
        <Link href="/queen" className="block px-6 py-3 text-lg font-semibold bg-red-800 hover:bg-red-600 rounded-md transition">
          Call Your Queen
        </Link>
        <Link href="/princess" className="block px-6 py-3 text-lg font-semibold bg-red-800 hover:bg-red-600 rounded-md transition">
          Call Your Princess
        </Link>
        <Link href="/king" className="block px-6 py-3 text-lg font-semibold bg-red-800 hover:bg-red-600 rounded-md transition">
          Call Your King
        </Link>
      </div>
    </main>
  );
}
